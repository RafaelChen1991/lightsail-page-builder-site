import Link from "next/link";
import { loginAction } from "./actions";

export default function LoginPage({
  searchParams
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="authShell">
      <form action={loginAction} className="authPanel">
        <Link href="/" className="brand">PageBuilder</Link>
        <h1>後台登入</h1>
        <p>使用種子資料建立的管理者帳號登入，即可修改前台內容。</p>
        {searchParams.error ? <div className="formError">帳號或密碼不正確</div> : null}
        <label>
          Email
          <input type="email" name="email" defaultValue="admin@example.com" required />
        </label>
        <label>
          Password
          <input type="password" name="password" placeholder="change-me-now" required />
        </label>
        <button type="submit" className="primaryButton">登入</button>
      </form>
    </main>
  );
}
