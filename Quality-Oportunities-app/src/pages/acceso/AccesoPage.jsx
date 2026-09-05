import LoginForm from './LoginForm.jsx';

export default function AccesoPage({ onLogin }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-space-md">
      <div className="w-full max-w-md">
        <LoginForm onLogin={onLogin} />
      </div>
    </div>
  );
}
