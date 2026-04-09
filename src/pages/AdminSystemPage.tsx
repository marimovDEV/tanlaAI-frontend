import { useEffect, useState } from 'react';
import apiClient from '../api/client';

type SettingsResponse = {
  telegram_bot_token: string;
  deploy_enabled: boolean;
};

export default function AdminSystemPage() {
  const [token, setToken] = useState('');
  const [deployEnabled, setDeployEnabled] = useState(false);
  const [output, setOutput] = useState("Output bu yerda ko'rinadi...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiClient.get<SettingsResponse>('/admin/system-settings/').then(({ data }) => {
      setToken(data.telegram_bot_token || '');
      setDeployEnabled(Boolean(data.deploy_enabled));
    });
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
        <p className="text-sm text-slate-500">Bot token va deploy boshqaruvi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h2 className="font-semibold text-lg text-slate-800">Telegram Bot Token</h2>
          <input
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Yangi bot token"
            autoComplete="off"
          />
          <button
            onClick={saveToken}
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
          >
            Saqlash
          </button>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h2 className="font-semibold text-lg text-slate-800">Deploy Actions</h2>
          {!deployEnabled ? (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
              Deploy actions o&apos;chiq. Backend <code className="bg-red-100 px-1 rounded">.env</code> ga{' '}
              <code className="bg-red-100 px-1 rounded">ALLOW_ADMIN_DEPLOY_ACTIONS=True</code> qo&apos;ying.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => runAction('git_pull')} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">
                Git Pull
              </button>
              <button onClick={() => runAction('migrate')} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">
                Migrate
              </button>
              <button onClick={() => runAction('collectstatic')} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">
                Collectstatic
              </button>
              <button onClick={() => runAction('restart_service')} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">
                Restart
              </button>
              <button onClick={() => runAction('status_service')} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors col-span-2">
                Service Status
              </button>
            </div>
          )}
          <pre className="bg-slate-900 text-green-400 text-xs rounded-xl p-4 min-h-48 whitespace-pre-wrap overflow-auto font-mono">
            {output}
          </pre>
        </section>
      </div>
    </div>
  );
}
