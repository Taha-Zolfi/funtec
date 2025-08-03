import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Eye,
  User,
  Share2,
  Clock,
  ArrowLeft,
  ChevronRight,
  Star,
  ChevronLeft
} from 'lucide-react';
import { db } from '../../api';
import './NewsDetails.css';

const RelatedArticleCard = memo(({ article, onReadingTimeCalculate }) => (
  <Link to={`/news/${article.id}`} className="related-card">
    <div className="related-image">
      <img
        src={article.image || "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"}
        alt={article.title}
        loading="lazy"
        onError={(e) => {
          e.target.src = "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg";
        }}
      />
    </div>
    <div className="related-content">
      <div className="related-meta">
        <span className="related-category">{article.category || 'عمومی'}</span>
        <span className="related-date">{new Date(article.created_at).toLocaleDateString('fa-IR')}</span>
      </div>
      <h3 className="related-card-title">{article.title}</h3>
      <p className="related-excerpt">{article.excerpt}</p>
      <div className="related-stats">
        <span className="related-views">
          <Eye size={14} />
          {article.views >= 1000 ? `${(article.views / 1000).toFixed(1)}k` : article.views || 0}
        </span>
        <span className="related-reading-time">
          <Clock size={14} />
          {onReadingTimeCalculate(article.content)} دقیقه
        </span>
      </div>
    </div>
  </Link>
));

const NewsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [prevArticle, setPrevArticle] = useState(null);
  const [nextArticle, setNextArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const formatViews = useCallback((views) => {
    return views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views || 0;
  }, []);

  const getReadingTime = useCallback((content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  }, []);

  const articleParagraphs = useMemo(() => {
    if (!article?.content) return [];
    return article.content.split('\n').filter(p => p.trim());
  }, [article?.content]);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const newsArticle = await db.getNewsItem(parseInt(id));
        if (!newsArticle) {
          setError('خبر مورد نظر یافت نشد');
          return;
        }

        setArticle(newsArticle);

        const allNews = await db.getNews();
        const currentIndex = allNews.findIndex(news => news.id === parseInt(id));

        if (currentIndex > 0) setPrevArticle(allNews[currentIndex - 1]);
        if (currentIndex < allNews.length - 1) setNextArticle(allNews[currentIndex + 1]);

        if (newsArticle.category) {
          const related = allNews
            .filter(news => news.id !== parseInt(id) && news.category === newsArticle.category)
            .slice(0, 3);
          setRelatedNews(related);
        }
      } catch (err) {
        console.error('Error loading article:', err);
        setError('خطا در بارگذاری خبر');
      } finally {
        setIsLoading(false);
        setTimeout(() => setIsLoaded(true), 100);
      }
    };

    if (id) loadArticle();
  }, [id]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: article.title,
      text: article.excerpt,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('لینک کپی شد!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [article]);

  if (isLoading) {
    return <div className="loading-state">در حال بارگذاری خبر...</div>;
  }

  if (error || !article) {
    return (
      <div className="error-state">
        <h2>خطا در بارگذاری</h2>
        <p>{error || 'خبر مورد نظر یافت نشد'}</p>
        <button onClick={() => navigate('/news')} className="back-to-news-btn">
          <ArrowLeft size={20} /> بازگشت به اخبار
        </button>
      </div>
    );
  }
  return (
    <div className={`news-detail-page ${isLoaded ? 'loaded' : ''}`}>
      <div className="news-detail-background" />
      <div className="news-detail-floating-elements">
        <div className="news-detail-orb news-detail-orb-1" />
        <div className="news-detail-orb news-detail-orb-2" />
      </div>

      <div className="news-detail-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/news">اخبار</Link>
          <span className="breadcrumb-separator">
            <ChevronRight size={16} />
          </span>
          <Link to={`/news?category=${article.category}`}>
            {article.category || 'عمومی'}
          </Link>
          <span className="breadcrumb-separator">
            <ChevronRight size={16} />
          </span>
          <span>{article.title}</span>
        </nav>

        {/* Article Container */}
        <article className="article-container">
          {/* Article Header */}
          <header className="article-header">
            <div className="article-badges">
              <span className="article-category">{article.category || 'عمومی'}</span>
              {article.is_featured && (
                <div className="article-featured-badge">
                  <Star size={16} />
                  <span>خبر ویژه</span>
                </div>
              )}
            </div>

            <h1 className="article-title">{article.title}</h1>

            <div className="article-excerpt">{article.excerpt}</div>

            <div className="article-meta">
              <div className="article-meta-left">
                <div className="meta-item">
                  <Calendar size={18} />
                  <span>{formatDate(article.created_at)}</span>
                </div>
                <div className="meta-item">
                  <Eye size={18} />
                  <span>{formatViews(article.views)} بازدید</span>
                </div>
                <div className="meta-item">
                  <Clock size={18} />
                  <span>{getReadingTime(article.content)} دقیقه مطالعه</span>
                </div>
                <div className="meta-item">
                  <User size={18} />
                  <span>{article.author || 'فان تک'}</span>
                </div>
              </div>

              <div className="article-actions">
                <button onClick={handleShare} className="share-btn">
                  <Share2 size={18} />
                  <span>اشتراک‌گذاری</span>
                </button>
                <Link to="/news" className="nback-btn">
                  <ArrowLeft size={18} />
                  <span>بازگشت</span>
                </Link>
              </div>
            </div>
          </header>

          {/* Article Image */}
          {article.image && (
            <div className="article-image-container">
              <img
                src={article.image}
                alt={article.title}
                className="article-image"
                onError={(e) => {
                  e.target.src = "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg";
                }}
              />
            </div>
          )}

          {/* Article Content */}
          <div className="article-content">
            <div className="article-text">
              {articleParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Article Footer */}
          <footer className="article-footer">
            <div className="footer-info">
              <p>آخرین بروزرسانی: {formatDate(article.updated_at)}</p>
            </div>
            <div className="footer-actions">
              <button onClick={handleShare} className="share-btn">
                <Share2 size={18} />
                اشتراک‌گذاری
              </button>
            </div>
          </footer>
        </article>

        {/* Article Navigation */}
        {(prevArticle || nextArticle) && (
          <div className="article-navigation">
            {prevArticle && (
              <Link to={`/news/${prevArticle.id}`} className="nav-article prev">
                <div className="nav-label">
                  <ChevronRight size={16} />
                  مطلب قبلی
                </div>
                <div className="nav-title">{prevArticle.title}</div>
                <div className="nav-meta">
                  <span>{formatDate(prevArticle.created_at)}</span>
                  <span>{formatViews(prevArticle.views)} بازدید</span>
                </div>
              </Link>
            )}
            {nextArticle && (
              <Link to={`/news/${nextArticle.id}`} className="nav-article next">
                <div className="nav-label">
                  مطلب بعدی
                  <ChevronLeft size={16} />
                </div>
                <div className="nav-title">{nextArticle.title}</div>
                <div className="nav-meta">
                  <span>{formatDate(nextArticle.created_at)}</span>
                  <span>{formatViews(nextArticle.views)} بازدید</span>
                </div>
              </Link>
            )}
          </div>
        )}

        {/* Related Articles */}
        {relatedNews.length > 0 && (
          <section className="related-articles">
            <div className="related-header">
              <h2 className="related-title">اخبار مرتبط</h2>
              <div className="related-line"></div>
            </div>

            <div className="related-grid">
              {relatedNews.map((relatedArticle) => (
                <RelatedArticleCard
                  key={relatedArticle.id}
                  article={relatedArticle}
                  onReadingTimeCalculate={getReadingTime}
                />
              ))}
            </div>

            <div className="view-all-news">
              <Link to="/news" className="view-all-btn">
                <span>مشاهده همه اخبار</span>
                <ArrowLeft size={18} />
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default NewsDetails;