import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

type SettingsResponse = {
  telegram_bot_token: string;
  deploy_enabled: boolean;
};

export default function AdminSystemPage() {
  const [token, setToken] = useState('');
  const [deployEnabled, setDeployEnabled] = useState(false);
  const [output, setOutput] = useState('Output bu yerda ko‘rinadi...');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checkAuthAndLoad = async () => {
    try {
      await apiClient.get('/admin/me/');
      const { data } = await apiClient.get<SettingsResponse>('/admin/system-settings/');
      setToken(data.telegram_bot_token || '');
      setDeployEnabled(Boolean(data.deploy_enabled));
    } catch {
      navigate('/adminka/login');
    }
  };

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const saveToken = async () => {
    setLoading(true);
    try {
      await apiClient.post('/admin/system-settings/', { telegram_bot_token: token });
      setOutput('Token saqlandi.');
    } catch (e: any) {
      setOutput(e?.response?.data?.message || 'Tokenni saqlashda xatolik.');
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (action: string) => {
    setLoading(true);
    setOutput(`Running: ${action}...`);
    try {
      const { data } = await apiClient.post('/admin/run-action/', { action });
      setOutput(
        [
          `status: ${data.status}`,
          `exit_code: ${data.exit_code ?? '-'}`,
          `command: ${data.command ?? '-'}`,
          '',
          data.output || data.message || 'No output',
        ].join('\n'),
      );
    } catch (e: any) {
      setOutput(
        e?.response?.data?.message ||
          e?.response?.data?.output ||
          'Command ishga tushmadi.',
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await apiClient.post('/admin/logout/');
    navigate('/adminka/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin System (React)</h1>
            <p className="text-sm text-slate-500">Bot token va deploy boshqaruvi</p>
          </div>
          <button onClick={logout} className="bg-slate-800 text-white rounded-lg px-4 py-2">
            Chiqish
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="font-semibold text-lg">Telegram Bot Token</h2>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Yangi bot token"
              autoComplete="off"
            />
            <button
              onClick={saveToken}
              disabled={loading}
              className="bg-sky-600 text-white rounded-lg px-4 py-2 disabled:opacity-60"
            >
              Saqlash
            </button>
          </section>

          <section className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="font-semibold text-lg">Deploy Actions</h2>
            {!deployEnabled ? (
              <p className="text-sm text-red-600">
                Deploy actions o‘chiq. Backend `.env` ga `ALLOW_ADMIN_DEPLOY_ACTIONS=True` qo‘ying.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => runAction('git_pull')} className="border rounded-lg px-3 py-2">
                  Git Pull
                </button>
                <button onClick={() => runAction('migrate')} className="border rounded-lg px-3 py-2">
                  Migrate
                </button>
                <button onClick={() => runAction('collectstatic')} className="border rounded-lg px-3 py-2">
                  Collectstatic
                </button>
                <button onClick={() => runAction('restart_service')} className="border rounded-lg px-3 py-2">
                  Restart
                </button>
                <button onClick={() => runAction('status_service')} className="border rounded-lg px-3 py-2 col-span-2">
                  Service Status
                </button>
              </div>
            )}
            <pre className="bg-black text-green-300 text-xs rounded-lg p-3 min-h-48 whitespace-pre-wrap overflow-auto">
              {output}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
