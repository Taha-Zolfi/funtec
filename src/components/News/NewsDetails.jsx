import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Calendar, Eye, User, Share2, Clock, Tag, ArrowLeft, ChevronRight, Star, List, MessageSquare, ThumbsUp, ChevronLeft, Bookmark, BookmarkCheck, Heart, Download, Printer as Print, Copy, Facebook, Twitter, Send, Zap, TrendingUp, Award, Users, MessageCircle, Volume2, VolumeX, Maximize, Minimize, RefreshCw, ExternalLink } from 'lucide-react'
import { db } from '../database/db.js'
import './NewsDetails.css'

// بهینه‌سازی کامپوننت RelatedArticleCard
const RelatedArticleCard = memo(({ article, onReadingTimeCalculate }) => (
  <Link to={`/news/${article.id}`} className="related-card">
    <div className="related-image">
      <img
        src={article.image || "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"}
        alt={article.title}
        loading="lazy"
        onError={(e) => {
          e.target.src = "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"
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

// بهینه‌سازی کامپوننت CommentItem
const CommentItem = memo(({ comment, onCommentLike }) => (
  <div className="comment-item" data-comment-id={comment.id}>
    <div className="comment-header">
      <span className="comment-author">{comment.name}</span>
      <span className="comment-date">{comment.date}</span>
    </div>
    <p className="comment-text">{comment.comment}</p>
    <div className="comment-actions">
      <button 
        className="comment-like-btn"
        onClick={() => onCommentLike(comment.id)}
      >
        <ThumbsUp size={16} />
        <span>{comment.likes || 0}</span>
      </button>
      <button className="comment-reply-btn">
        <MessageCircle size={16} />
        پاسخ
      </button>
    </div>
    
    {comment.replies && comment.replies.length > 0 && (
      <div className="comment-replies">
        {comment.replies.map((reply) => (
          <div key={reply.id} className="reply-item">
            <div className="reply-header">
              <span className="reply-author">{reply.name}</span>
              <span className="reply-date">{reply.date}</span>
            </div>
            <p className="reply-text">{reply.comment}</p>
          </div>
        ))}
      </div>
    )}
  </div>
));

const NewsDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [relatedNews, setRelatedNews] = useState([])
  const [prevArticle, setPrevArticle] = useState(null)
  const [nextArticle, setNextArticle] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [readingProgress, setReadingProgress] = useState(0)
  const [rating, setRating] = useState(0)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState({
    name: '',
    email: '',
    comment: ''
  })
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState('medium')
  const [isTextToSpeechActive, setIsTextToSpeechActive] = useState(false)
  const [readingTime, setReadingTime] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [shareCount, setShareCount] = useState(0)
  const [viewHistory, setViewHistory] = useState([])
  const [relatedByCategory, setRelatedByCategory] = useState([])
  const [popularArticles, setPopularArticles] = useState([])
  const [recentArticles, setRecentArticles] = useState([])
  const [estimatedReadingTime, setEstimatedReadingTime] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)

  // بهینه‌سازی محاسبات با useMemo
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const formatViews = useCallback((views) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views || 0;
  }, []);

  const getReadingTime = useCallback((content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  }, []);

  // بهینه‌سازی پاراگراف‌های مقاله
  const articleParagraphs = useMemo(() => {
    if (!article?.content) return [];
    return article.content.split('\n').filter(paragraph => paragraph.trim());
  }, [article?.content]);

  useEffect(() => {
    const loadArticle = () => {
      try {
        const newsArticle = db.getNewsById(parseInt(id))
        
        if (!newsArticle) {
          setError('خبر مورد نظر یافت نشد')
          return
        }

        setArticle(newsArticle)
        
        // افزایش بازدید
        db.updateNews(parseInt(id), { views: (newsArticle.views || 0) + 1 })
        
        // محاسبه آمار مطالعه
        const words = newsArticle.content.split(' ').length
        setWordCount(words)
        setReadingTime(Math.ceil(words / 200))
        setEstimatedReadingTime(Math.ceil(words / 200))
        
        // بارگذاری تنظیمات کاربر
        const bookmarked = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]')
        const liked = JSON.parse(localStorage.getItem('likedArticles') || '[]')
        const savedFontSize = localStorage.getItem('fontSize') || 'medium'
        
        setIsBookmarked(bookmarked.includes(parseInt(id)))
        setIsLiked(liked.includes(parseInt(id)))
        setFontSize(savedFontSize)
        setLikeCount(Math.floor(Math.random() * 50) + 10)
        setShareCount(Math.floor(Math.random() * 30) + 5)
        
        // بارگذاری اخبار مرتبط و ناوبری
        const allNews = db.getNews()
        const currentIndex = allNews.findIndex(news => news.id === parseInt(id))
        
        // مقالات قبلی و بعدی
        if (currentIndex > 0) {
          setPrevArticle(allNews[currentIndex - 1])
        }
        if (currentIndex < allNews.length - 1) {
          setNextArticle(allNews[currentIndex + 1])
        }
        
        // مقالات مرتبط از همان دسته
        if (newsArticle.category) {
          const related = allNews
            .filter(news => news.id !== parseInt(id) && news.category === newsArticle.category)
            .slice(0, 3)
          setRelatedNews(related)
          setRelatedByCategory(related)
        }
        
        // مقالات محبوب و جدید
        const popular = allNews
          .filter(news => news.id !== parseInt(id))
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5)
        setPopularArticles(popular)
        
        const recent = allNews
          .filter(news => news.id !== parseInt(id))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
        setRecentArticles(recent)
        
        // اضافه کردن به تاریخچه مشاهده
        const history = JSON.parse(localStorage.getItem('viewHistory') || '[]')
        const updatedHistory = [newsArticle, ...history.filter(item => item.id !== newsArticle.id)].slice(0, 10)
        localStorage.setItem('viewHistory', JSON.stringify(updatedHistory))
        setViewHistory(updatedHistory)
        
        // بارگذاری نظرات نمونه
        setComments([
          {
            id: 1,
            name: 'احمد محمدی',
            date: '۱۴۰۳/۰۱/۱۵',
            comment: 'مطلب بسیار مفیدی بود. ممنون از اطلاعات ارزشمند.',
            likes: 5,
            replies: []
          },
          {
            id: 2,
            name: 'فاطمه احمدی',
            date: '۱۴۰۳/۰۱/۱۴',
            comment: 'عالی بود! منتظر مطالب بیشتری از این دست هستیم.',
            likes: 3,
            replies: [
              {
                id: 3,
                name: 'تیم فان تک',
                date: '۱۴۰۳/۰۱/۱۴',
                comment: 'ممنون از نظر شما! به زودی مطالب جدید منتشر خواهیم کرد.'
              }
            ]
          }
        ])
      } catch (error) {
        console.error('Error loading article:', error)
        setError('خطا در بارگذاری خبر')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadArticle()
    }
  }, [id])
  
  // ردیابی پیشرفت مطالعه
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setReadingProgress(Math.min(progress, 100))
      setScrollProgress(Math.min(progress, 100))
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // ذخیره خودکار موقعیت مطالعه
  useEffect(() => {
    if (article && readingProgress > 10) {
      localStorage.setItem(`reading-position-${article.id}`, readingProgress.toString())
    }
  }, [readingProgress, article])
  
  // بارگذاری موقعیت ذخیره شده
  useEffect(() => {
    if (article) {
      const savedPosition = localStorage.getItem(`reading-position-${article.id}`)
      if (savedPosition && parseFloat(savedPosition) > 10) {
        setTimeout(() => {
          const shouldRestore = window.confirm('آیا می‌خواهید از جایی که قبلاً متوقف شده‌اید ادامه دهید؟')
          if (shouldRestore) {
            const targetScroll = (parseFloat(savedPosition) / 100) * document.documentElement.scrollHeight
            window.scrollTo({ top: targetScroll, behavior: 'smooth' })
          }
        }, 1000);
      }
    }
  }, [article])

  const handleShare = useCallback(async () => {
    const shareData = {
      title: article.title,
      text: article.excerpt,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('لینک کپی شد!')
      }
      setShareCount(prev => prev + 1)
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }, [article]);
  
  const handleSpecificShare = useCallback((platform) => {
    const url = window.location.href
    const text = article.title
    
    let shareUrl = ''
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        break
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
        break
      default:
        return
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400')
    setShareCount(prev => prev + 1)
  }, [article]);
  
  const handleBookmark = useCallback(() => {
    const bookmarked = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]')
    let updatedBookmarks
    
    if (isBookmarked) {
      updatedBookmarks = bookmarked.filter(articleId => articleId !== parseInt(id))
      setIsBookmarked(false)
      showNotification('حذف از نشان‌ها', 'مقاله از نشان‌های شما حذف شد')
    } else {
      updatedBookmarks = [...bookmarked, parseInt(id)]
      setIsBookmarked(true)
      showNotification('افزودن به نشان‌ها', 'مقاله به نشان‌های شما اضافه شد')
    }
    
    localStorage.setItem('bookmarkedArticles', JSON.stringify(updatedBookmarks))
  }, [id, isBookmarked]);
  
  const handleLike = useCallback(() => {
    const liked = JSON.parse(localStorage.getItem('likedArticles') || '[]')
    let updatedLikes
    
    if (isLiked) {
      updatedLikes = liked.filter(articleId => articleId !== parseInt(id))
      setIsLiked(false)
      setLikeCount(prev => prev - 1)
    } else {
      updatedLikes = [...liked, parseInt(id)]
      setIsLiked(true)
      setLikeCount(prev => prev + 1)
      showNotification('پسندیدن', 'مقاله پسندیده شد!')
    }
    
    localStorage.setItem('likedArticles', JSON.stringify(updatedLikes))
  }, [id, isLiked]);
  
  const handlePrint = useCallback(() => {
    window.print()
  }, []);
  
  const handleDownload = useCallback(() => {
    const content = `
${article.title}

${article.excerpt}

${article.content}

نویسنده: ${article.author || 'فان تک'}
تاریخ انتشار: ${formatDate(article.created_at)}
منبع: ${window.location.href}
    `
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${article.title}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [article, formatDate]);
  
  const handleTextToSpeech = useCallback(() => {
    if (isTextToSpeechActive) {
      speechSynthesis.cancel()
      setIsTextToSpeechActive(false)
    } else {
      const utterance = new SpeechSynthesisUtterance(article.content)
      utterance.lang = 'fa-IR'
      utterance.rate = 0.8
      utterance.onend = () => setIsTextToSpeechActive(false)
      speechSynthesis.speak(utterance)
      setIsTextToSpeechActive(true)
    }
  }, [isTextToSpeechActive, article]);
  
  const handleFullscreen = useCallback(() => {
    if (isFullscreen) {
      document.exitFullscreen()
      setIsFullscreen(false)
    } else {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    }
  }, [isFullscreen]);
  
  const handleFontSizeChange = useCallback((size) => {
    setFontSize(size)
    localStorage.setItem('fontSize', size)
  }, []);
  
  const showNotification = useCallback((title, message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message })
    }
  }, []);
  
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      showNotification('کپی شد', 'متن در کلیپ‌بورد کپی شد')
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }, [showNotification]);
  
  const handleRating = useCallback((stars) => {
    setRating(stars)
    showNotification('امتیازدهی', `شما ${stars} ستاره به این مقاله دادید`)
  }, [showNotification]);
  
  const handleCommentSubmit = useCallback((e) => {
    e.preventDefault()
    if (newComment.name && newComment.comment) {
      const comment = {
        id: comments.length + 1,
        name: newComment.name,
        date: new Date().toLocaleDateString('fa-IR'),
        comment: newComment.comment,
        likes: 0,
        replies: []
      }
      setComments([comment, ...comments])
      setNewComment({ name: '', email: '', comment: '' })
      alert('نظر شما با موفقیت ثبت شد!')
    }
  }, [newComment, comments]);
  
  const handleCommentLike = useCallback((commentId) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: (comment.likes || 0) + 1 }
        : comment
    ))
  }, []);

  if (isLoading) {
    return (
      <div className={`news-detail-page font-${fontSize}`}>
        <div className="news-detail-background" />
        <div className="news-detail-floating-elements">
          <div className="news-detail-orb news-detail-orb-1" />
          <div className="news-detail-orb news-detail-orb-2" />
        </div>
        <div className="news-detail-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">در حال بارگذاری خبر...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className={`news-detail-page font-${fontSize}`}>
        <div className="news-detail-background" />
        <div className="news-detail-floating-elements">
          <div className="news-detail-orb news-detail-orb-1" />
          <div className="news-detail-orb news-detail-orb-2" />
        </div>
        <div className="news-detail-container">
          <div className="error-state">
            <h2>خطا در بارگذاری</h2>
            <p>{error || 'خبر مورد نظر یافت نشد'}</p>
            <button onClick={() => navigate('/news')} className="back-to-news-btn">
              <ArrowLeft size={20} />
              بازگشت به اخبار
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`news-detail-page font-${fontSize} ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Reading Progress Bar */}
      <div className="reading-progress" style={{ width: `${readingProgress}%` }}></div>
      
      {/* Advanced Reading Progress */}
      <div className="advanced-progress">
        <div className="progress-info">
          <span>{Math.round(scrollProgress)}% خوانده شده</span>
          <span>{estimatedReadingTime - Math.round((estimatedReadingTime * scrollProgress) / 100)} دقیقه باقی‌مانده</span>
        </div>
      </div>
      
      {/* Floating Action Buttons */}
      <div className="floating-actions">
        <button 
          className={`fab bookmark ${isBookmarked ? 'active' : ''}`}
          onClick={handleBookmark}
          title="نشان کردن"
        >
          {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
        </button>
        
        <button 
          className={`fab like ${isLiked ? 'active' : ''}`}
          onClick={handleLike}
          title="پسندیدن"
        >
          <Heart size={20} />
          <span className="fab-count">{likeCount}</span>
        </button>
        
        <button 
          className="fab share"
          onClick={handleShare}
          title="اشتراک‌گذاری"
        >
          <Share2 size={20} />
          <span className="fab-count">{shareCount}</span>
        </button>
        
        <button 
          className="fab print"
          onClick={handlePrint}
          title="چاپ"
        >
          <Print size={20} />
        </button>
        
        <button 
          className="fab download"
          onClick={handleDownload}
          title="دانلود"
        >
          <Download size={20} />
        </button>
        
        <button 
          className={`fab tts ${isTextToSpeechActive ? 'active' : ''}`}
          onClick={handleTextToSpeech}
          title="خواندن متن"
        >
          {isTextToSpeechActive ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        
        <button 
          className="fab fullscreen"
          onClick={handleFullscreen}
          title="تمام صفحه"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>
      
      {/* Font Size Controls */}
      <div className="font-controls">
        <button 
          className={`font-btn ${fontSize === 'small' ? 'active' : ''}`}
          onClick={() => handleFontSizeChange('small')}
        >
          A
        </button>
        <button 
          className={`font-btn ${fontSize === 'medium' ? 'active' : ''}`}
          onClick={() => handleFontSizeChange('medium')}
        >
          A
        </button>
        <button 
          className={`font-btn ${fontSize === 'large' ? 'active' : ''}`}
          onClick={() => handleFontSizeChange('large')}
        >
          A
        </button>
      </div>
      

      
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
              <div className="article-trending-badge">
                <TrendingUp size={16} />
                <span>محبوب</span>
              </div>
              <div className="article-award-badge">
                <Award size={16} />
                <span>برگزیده</span>
              </div>
            </div>

            <h1 className="article-title">{article.title}</h1>
            
            <div className="article-excerpt">
              {article.excerpt}
            </div>

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
                  <span>{readingTime} دقیقه مطالعه</span>
                </div>
                <div className="meta-item">
                  <User size={18} />
                  <span>{article.author || 'فان تک'}</span>
                </div>
                <div className="meta-item">
                  <MessageCircle size={18} />
                  <span>{comments.length} نظر</span>
                </div>
                <div className="meta-item">
                  <Heart size={18} />
                  <span>{likeCount} پسند</span>
                </div>
                <div className="meta-item">
                  <Share2 size={18} />
                  <span>{shareCount} اشتراک</span>
                </div>
              </div>
              
              <div className="article-actions">
                <div className="social-share-buttons">
                  <button 
                    className="social-share-btn facebook"
                    onClick={() => handleSpecificShare('facebook')}
                    title="اشتراک در فیسبوک"
                  >
                    <Facebook size={18} />
                  </button>
                  <button 
                    className="social-share-btn twitter"
                    onClick={() => handleSpecificShare('twitter')}
                    title="اشتراک در توییتر"
                  >
                    <Twitter size={18} />
                  </button>
                  <button 
                    className="social-share-btn telegram"
                    onClick={() => handleSpecificShare('telegram')}
                    title="اشتراک در تلگرام"
                  >
                    <Send size={18} />
                  </button>
                  <button 
                    className="social-share-btn copy"
                    onClick={() => copyToClipboard(window.location.href)}
                    title="کپی لینک"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                
                <button onClick={handleShare} className="share-btn">
                  <Share2 size={18} />
                  <span>اشتراک‌گذاری</span>
                </button>
                <Link to="/news" className="back-btn">
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
                  e.target.src = "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"
                }}
              />
              <div className="image-overlay">
                <button 
                  className="image-action-btn"
                  onClick={() => window.open(article.image, '_blank')}
                  title="مشاهده تصویر کامل"
                >
                  <ExternalLink size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="article-content" id="article-content">
            <div className="content-stats">
              <div className="stat">
                <span className="stat-number">{wordCount}</span>
                <span className="stat-label">کلمه</span>
              </div>
              <div className="stat">
                <span className="stat-number">{readingTime}</span>
                <span className="stat-label">دقیقه مطالعه</span>
              </div>
              <div className="stat">
                <span className="stat-number">{Math.round(scrollProgress)}%</span>
                <span className="stat-label">پیشرفت</span>
              </div>
            </div>
            
            <div className="article-text">
              {articleParagraphs.map((paragraph, index) => (
                <p key={index}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="article-tags" id="article-tags">
                <div className="tags-header">
                  <Tag size={18} />
                  <span>برچسب‌ها:</span>
                </div>
                <div className="tags-list">
                  {article.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Article Rating */}
            <div className="article-rating" id="article-rating">
              <h3 className="rating-title">این مطلب را چگونه ارزیابی می‌کنید؟</h3>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`rating-star ${star <= rating ? 'active' : ''}`}
                    onClick={() => handleRating(star)}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              {rating > 0 && (
                <button className="rating-submit">
                  ثبت امتیاز ({rating} ستاره)
                </button>
              )}
              <div className="rating-stats">
                <div className="rating-average">
                  <span className="average-number">4.2</span>
                  <span className="average-label">میانگین امتیاز</span>
                </div>
                <div className="rating-count">
                  <span className="count-number">127</span>
                  <span className="count-label">نفر امتیاز داده‌اند</span>
                </div>
              </div>
            </div>
          </div>

          {/* Article Footer */}
          <footer className="article-footer">
            <div className="footer-info">
              <p>آخرین بروزرسانی: {formatDate(article.updated_at)}</p>
              <p>تعداد کلمات: {wordCount} | زمان مطالعه: {readingTime} دقیقه</p>
            </div>
            <div className="footer-actions">
              <button onClick={handleBookmark} className={`action-btn ${isBookmarked ? 'active' : ''}`}>
                {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                {isBookmarked ? 'حذف نشان' : 'نشان کردن'}
              </button>
              <button onClick={handleLike} className={`action-btn like ${isLiked ? 'active' : ''}`}>
                <Heart size={18} />
                {isLiked ? 'لغو پسند' : 'پسندیدن'}
              </button>
              <button onClick={handleShare} className="share-btn">
                <Share2 size={18} />
                اشتراک‌گذاری
              </button>
            </div>
          </footer>
        </article>
        
        {/* Comments Section */}
        <section className="comments-section" id="comments">
          <div className="comments-header">
            <MessageSquare size={24} />
            <h2 className="comments-title">نظرات</h2>
            <span className="comments-count">{comments.length} نظر</span>
          </div>
          
          {/* Comment Form */}
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <div className="form-group">
              <label>نام *</label>
              <input
                type="text"
                value={newComment.name}
                onChange={(e) => setNewComment({...newComment, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>ایمیل</label>
              <input
                type="email"
                value={newComment.email}
                onChange={(e) => setNewComment({...newComment, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>نظر *</label>
              <textarea
                value={newComment.comment}
                onChange={(e) => setNewComment({...newComment, comment: e.target.value})}
                required
              ></textarea>
            </div>
            <button type="submit" className="comment-submit">
              ثبت نظر
            </button>
          </form>
          
          {/* Comments List */}
          <div className="comments-list">
            {comments.map((comment) => (
              <CommentItem 
                key={comment.id}
                comment={comment}
                onCommentLike={handleCommentLike}
              />
            ))}
          </div>
        </section>
        
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
          <section className="related-articles" id="related-articles">
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
        
        {/* Popular Articles Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <TrendingUp size={20} />
              محبوب‌ترین اخبار
            </h3>
            <div className="sidebar-articles">
              {popularArticles.slice(0, 5).map((article, index) => (
                <Link key={article.id} to={`/news/${article.id}`} className="sidebar-article">
                  <div className="sidebar-article-number">{index + 1}</div>
                  <div className="sidebar-article-content">
                    <h4 className="sidebar-article-title">{article.title}</h4>
                    <div className="sidebar-article-meta">
                      <span>{formatViews(article.views)} بازدید</span>
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <Zap size={20} />
              جدیدترین اخبار
            </h3>
            <div className="sidebar-articles">
              {recentArticles.slice(0, 5).map((article) => (
                <Link key={article.id} to={`/news/${article.id}`} className="sidebar-article">
                  <div className="sidebar-article-image">
                    <img 
                      src={article.image || "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"} 
                      alt={article.title}
                      onError={(e) => {
                        e.target.src = "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"
                      }}
                    />
                  </div>
                  <div className="sidebar-article-content">
                    <h4 className="sidebar-article-title">{article.title}</h4>
                    <div className="sidebar-article-meta">
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default NewsDetail