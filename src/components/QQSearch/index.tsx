import { FormEvent, useCallback, useState } from 'react';
import styles from './index.module.scss';
import { debounce } from 'lodash-es';
import useFetch from './useFetch';
import { ReactComponent as LoadingIcon } from './img/loading.svg';

export default function QQSearch() {
  const [account, setAccount] = useState<string>('');
  const [validateMsg, setValidateMsg] = useState<string>();

  const { data, error, loading, clearData, fetchData } = useFetch();

  const fetchQQ = useCallback(debounce(fetchData, 300), []);

  const qqValidate = (value: string) => {
    const qqReg = /^[1-9]\d{4,10}$/;
    if (!qqReg.test(value)) {
      return 'QQ 号格式不正确';
    }
  };

  const handleAcountInput = async (e: FormEvent<HTMLInputElement>) => {
    clearData();
    const value = e.currentTarget.value;

    setAccount(value);
    const msg = qqValidate(value);
    setValidateMsg(msg);

    if (!msg) {
      await fetchQQ(value);
    }
  };

  return (
    <div className={styles.qqSearch}>
      <header className={styles.header}>
        <h1>QQ 号查询</h1>
      </header>
      <div>
        <div className={styles.account}>
          <label htmlFor="qq">QQ</label>
          <input name="qq" onInput={handleAcountInput} placeholder="请输入 QQ 号" />
          {loading && <LoadingIcon className={styles.loading} />}
        </div>
        {validateMsg && <div className={styles.error}>{validateMsg}</div>}
        {error && <div className={styles.error}>{error}</div>}
        {data && (
          <div className={styles.qqInfo}>
            <div className={styles.avatar}>
              <img alt="qq 头像" src={data?.qlogo} />
            </div>
            <div className={styles.info}>
              <div>{data?.name}</div>
              <div>{account}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
