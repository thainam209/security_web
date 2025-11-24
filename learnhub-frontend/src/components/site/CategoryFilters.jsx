import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CategoryFilters() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState('Tất cả Gợi ý');

  // Danh sách categories mặc định
  const defaultCategories = [
    'Tất cả Gợi ý',
    'Marketing',
    'Ngoại ngữ',
    'Sức khỏe & Thể hình',
    'CNTT & Phần mềm',
    'Tài chính & Kế toán',
    'Trí tuệ nhân tạo',
    'Kinh doanh',
    'Thiết kế',
    'Phân tích dữ liệu',
    'Phân Tích Và Trực Quan Hóa Dữ Liệu',
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/v1/categories');
        const list = res.data?.data?.categories || res.data?.data || [];
        setCategories(list);
      } catch (e) {
        // ignore, keep default
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName) => {
    if (categoryName === 'Tất cả Gợi ý') {
      setActive(categoryName);
      navigate('/search');
      return;
    }

    setActive(categoryName);
    
    // Tìm category object từ backend
    const found = categories.find(c => {
      const catName = c.categoryname || c.name || '';
      return catName === categoryName || catName.toLowerCase() === categoryName.toLowerCase();
    });
    
    if (found) {
      navigate(`/search?categoryId=${found.categoryid}&categoryName=${encodeURIComponent(found.categoryname)}`);
    } else {
      // Nếu không tìm thấy trong backend, vẫn navigate với tên category
      navigate(`/search?categoryName=${encodeURIComponent(categoryName)}`);
    }
  };

  // Luôn hiển thị danh sách categories mặc định
  // Nếu có categories từ backend, sẽ map và tìm category tương ứng khi click
  const displayCategories = defaultCategories;

  return (
    <div className="container mx-auto px-6 mt-6">
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none]">
        {displayCategories.map((categoryName) => {
          const isActive = categoryName === active;
          return (
            <button
              key={categoryName}
              onClick={() => handleCategoryClick(categoryName)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors shadow-sm border cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              type="button"
            >
              {categoryName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
