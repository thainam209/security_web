import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  // Backend sẽ redirect đến đây sau khi xử lý
  const success = searchParams.get('success') === 'true';
  const orderId = searchParams.get('orderId');
  const message = searchParams.get('message');

  useEffect(() => {
    if (orderId && success) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId, success]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:8080/api/v1/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrder(response.data.data);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang xử lý...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {success ? (
            <>
              <FaCheckCircle className="text-6xl text-emerald-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
              <p className="text-gray-600 mb-6">
                Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được xử lý thành công.
              </p>
              {orderId && (
                <p className="text-sm text-gray-500 mb-6">
                  Mã đơn hàng: <span className="font-semibold">#{orderId}</span>
                </p>
              )}
              {order && order.orderdetails && order.orderdetails.length > 0 && (
                <div className="mb-6 text-left">
                  <h2 className="font-semibold text-gray-900 mb-2">Khóa học đã mua:</h2>
                  <ul className="space-y-2">
                    {order.orderdetails.map((detail) => (
                      <li key={detail.orderdetailid} className="text-gray-600">
                        • {detail.course?.coursename || 'Khóa học'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/my-courses')}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Xem khóa học của tôi
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Về trang chủ
                </button>
              </div>
            </>
          ) : (
            <>
              <FaTimesCircle className="text-6xl text-red-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h1>
              <p className="text-gray-600 mb-6">
                {message || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.'}
              </p>
              {orderId && (
                <p className="text-sm text-gray-500 mb-6">
                  Mã đơn hàng: <span className="font-semibold">#{orderId}</span>
                </p>
              )}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/cart')}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Thử lại
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Về trang chủ
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;

