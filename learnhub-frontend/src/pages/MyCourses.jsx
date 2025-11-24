// src/pages/MyCourses.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../components/site/CourseCard';

const MyCourses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'courses';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tab = searchParams.get('tab') || 'courses';
    setActiveTab(tab);
    if (tab === 'courses' || tab === 'all-courses' || tab === 'completed') {
      fetchMyCourses();
    } else if (tab === 'wishlist') {
      fetchFavorites();
    }
  }, [searchParams]);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/v1/enrollments/my-courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const coursesData = response.data.data || [];
      
      // Transform enrolled courses to match CourseCard format
      const transformedCourses = await Promise.all(
        coursesData.map(async (course) => {
          const courseId = course.courseid;
          if (!courseId) return null;
          
          try {
            // Fetch full course details
            const [courseDetailRes, reviewsRes] = await Promise.all([
              axios.get(`http://localhost:8080/api/v1/courses/${courseId}`).catch(() => ({ data: { data: null } })),
              axios.get(`http://localhost:8080/api/v1/reviews/${courseId}`).catch(() => ({ data: { data: [] } }))
            ]);
            
            const fullCourse = courseDetailRes.data?.data || course;
            const reviews = reviewsRes.data?.data || [];
            
            // Calculate average rating
            const averageRating = reviews.length > 0
              ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
              : 0;
            
            // Calculate discount
            const oldPrice = fullCourse.originalPrice || course.originalPrice;
            const currentPrice = fullCourse.price || course.price || 0;
            const discount = oldPrice && currentPrice && oldPrice > currentPrice
              ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
              : 0;
            
            return {
              courseid: courseId,
              id: courseId,
              title: fullCourse.coursename || course.coursename || 'Khóa học không có tên',
              instructor: fullCourse.teacher?.fullname || 'Kitani Studio',
              description: fullCourse.description || course.description || 'Chưa có mô tả',
              image: fullCourse.thumbnailUrl || fullCourse.imageurl || course.imageurl || 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=1600&auto=format&fit=crop',
              price: currentPrice === 0 ? 'Miễn phí' : `${currentPrice.toLocaleString()} VND`,
              oldPrice: oldPrice ? `${oldPrice.toLocaleString()} VND` : null,
              rating: parseFloat(averageRating) || 4.8,
              reviewCount: reviews.length,
              badges: discount > 0 ? ['20% OFF'] : [],
              isEnrolled: true
            };
          } catch (err) {
            console.error(`Error fetching course ${courseId}:`, err);
            return {
              courseid: courseId,
              id: courseId,
              title: course.coursename || 'Khóa học không có tên',
              instructor: 'Kitani Studio',
              description: course.description || 'Chưa có mô tả',
              image: course.imageurl || 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=1600&auto=format&fit=crop',
              price: course.price === 0 ? 'Miễn phí' : `${course.price?.toLocaleString()} VND`,
              oldPrice: null,
              rating: 4.8,
              reviewCount: 0,
              badges: [],
              isEnrolled: true
            };
          }
        })
      );
      
      const validCourses = transformedCourses.filter(course => course !== null);
      setEnrolledCourses(validCourses);
      setError(null);
    } catch (err) {
      console.error('Error fetching my courses:', err);
      setError('Lỗi khi tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập để xem danh sách yêu thích');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:8080/api/v1/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const favoritesData = response.data.data || [];
      
      // Transform favorites data to match CourseCard format
      const transformedFavorites = await Promise.all(
        favoritesData.map(async (fav) => {
          const course = fav.course || {};
          const courseId = course.courseid;
          
          if (!courseId) return null;
          
          try {
            const [courseDetailRes, reviewsRes] = await Promise.all([
              axios.get(`http://localhost:8080/api/v1/courses/${courseId}`).catch(() => ({ data: { data: null } })),
              axios.get(`http://localhost:8080/api/v1/reviews/${courseId}`).catch(() => ({ data: { data: [] } }))
            ]);
            
            const fullCourse = courseDetailRes.data?.data || course;
            const reviews = reviewsRes.data?.data || [];
            
            const averageRating = reviews.length > 0
              ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
              : 0;
            
            const oldPrice = fullCourse.originalPrice || course.originalPrice;
            const currentPrice = fullCourse.price || course.price || 0;
            const discount = oldPrice && currentPrice && oldPrice > currentPrice
              ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
              : 0;
            
            return {
              courseid: courseId,
              id: courseId,
              title: fullCourse.coursename || course.coursename || 'Khóa học không có tên',
              instructor: fullCourse.teacher?.fullname || 'Kitani Studio',
              description: fullCourse.description || course.description || 'Chưa có mô tả',
              image: fullCourse.thumbnailUrl || fullCourse.imageurl || course.imageurl || 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=1600&auto=format&fit=crop',
              price: currentPrice === 0 ? 'Miễn phí' : `${currentPrice.toLocaleString()} VND`,
              oldPrice: oldPrice ? `${oldPrice.toLocaleString()} VND` : null,
              rating: parseFloat(averageRating) || 4.8,
              reviewCount: reviews.length,
              badges: discount > 0 ? ['20% OFF'] : []
            };
          } catch (err) {
            console.error(`Error fetching course ${courseId}:`, err);
            return {
              courseid: courseId,
              id: courseId,
              title: course.coursename || 'Khóa học không có tên',
              instructor: 'Kitani Studio',
              description: course.description || 'Chưa có mô tả',
              image: course.imageurl || 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=1600&auto=format&fit=crop',
              price: course.price === 0 ? 'Miễn phí' : `${course.price?.toLocaleString()} VND`,
              oldPrice: null,
              rating: 4.8,
              reviewCount: 0,
              badges: []
            };
          }
        })
      );
      
      const validFavorites = transformedFavorites.filter(fav => fav !== null);
      setFavorites(validFavorites);
      setError(null);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      if (err.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (err.response?.status === 403) {
        setError('Bạn không có quyền truy cập trang này.');
      } else {
        setError(err.response?.data?.message || 'Lỗi khi tải danh sách yêu thích. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    if (tab === 'courses' || tab === 'all-courses' || tab === 'completed') {
      fetchMyCourses();
    } else if (tab === 'wishlist') {
      fetchFavorites();
    }
  };

  const getCurrentCourses = () => {
    if (activeTab === 'wishlist') {
      return favorites;
    }
    // For now, all-courses and courses show the same enrolled courses
    // You can add filtering logic for completed courses later
    return enrolledCourses;
  };

  const currentCourses = getCurrentCourses();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Course</h1>
        </div>

        {/* Tabs Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-8 border-b border-gray-200">
            <button
              onClick={() => handleTabClick('all-courses')}
              className={`pb-3 px-1 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'all-courses'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Courses
            </button>
            <button
              onClick={() => handleTabClick('courses')}
              className={`pb-3 px-1 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'courses'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => handleTabClick('wishlist')}
              className={`pb-3 px-1 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'wishlist'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Wishlist
            </button>
            <button
              onClick={() => handleTabClick('completed')}
              className={`pb-3 px-1 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'completed'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => {
                if (activeTab === 'wishlist') {
                  fetchFavorites();
                } else {
                  fetchMyCourses();
                }
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        ) : currentCourses.length === 0 ? (
          <div className="text-center py-12">
            {activeTab === 'wishlist' ? (
              <>
                <svg
                  className="w-24 h-24 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Chưa có khóa học yêu thích</h2>
                <p className="text-gray-500 mb-6">Bạn chưa thêm khóa học nào vào danh sách yêu thích. Hãy khám phá các khóa học mới!</p>
              </>
            ) : (
              <>
                <svg
                  className="w-24 h-24 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Chưa có khóa học nào</h2>
                <p className="text-gray-500 mb-6">Bạn chưa đăng ký khóa học nào. Hãy khám phá các khóa học mới!</p>
              </>
            )}
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              Khám phá khóa học
            </button>
          </div>
        ) : (
          <>
            {/* Course Grid - 4 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {currentCourses.map((course) => (
                <CourseCard 
                  key={course.courseid || course.id} 
                  course={course}
                  onFavoriteToggle={activeTab === 'wishlist' ? fetchFavorites : undefined}
                />
              ))}
            </div>

            {/* Explore Courses Button */}
            <div className="text-center">
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Explore Courses
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
