import { useState, useEffect } from 'react';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // navigator.geolocation 객체가 지원되는지 확인
    if (!navigator.geolocation) {
      setError("현재 브라우저에서는 위치 정보가 지원되지 않습니다.");
      setIsLoading(false);
      return;
    }

    // 현재 위치를 가져오는 함수
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        // 사용자가 권한을 거부했거나, 위치를 찾을 수 없는 경우
        setError("현재 위치를 가져올 수 없습니다. 위치 정보 접근 권한을 확인해주세요.");
        setIsLoading(false);
      }
    );
  }, []); // 컴포넌트가 처음 마운트될 때 한 번만 실행

  return { location, error, isLoading };
};