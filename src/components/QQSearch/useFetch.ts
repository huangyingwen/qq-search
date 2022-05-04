import { useCallback, useRef, useState } from 'react';

type QQInfo = {
  code: number;
  name: string;
  qlogo: string;
  msg: string;
};

export default function useFetch() {
  const [data, setData] = useState<QQInfo>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const abortRef = useRef<AbortController>();

  const fetchData = useCallback(async (account: string) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const res = await fetch(`https://api.uomg.com/api/qq.info?qq=${account}`, { signal: abortRef.current.signal });
      if (!res.ok) {
        setError('请求错误');
        return;
      }

      const data: QQInfo = await res.json();

      if (data.code !== 1) {
        setError(data.msg);
        return;
      }

      setData(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = () => {
    abortRef.current?.abort();
    setData(undefined);
    setError(undefined);
  };

  return { clearData, data, error, loading, fetchData };
}
