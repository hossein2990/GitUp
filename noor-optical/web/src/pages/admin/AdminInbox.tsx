import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { formatDate, formatDigits } from '../../lib/format';
import { useI18n } from '../../lib/i18n';
import { Button, EmptyState, Skeleton } from '../../components/ui/primitives';

type Tab = 'appointments' | 'messages';

type Appointment = Awaited<ReturnType<typeof api.admin.appointments>>['items'][number];
type Message = Awaited<ReturnType<typeof api.admin.messages>>['items'][number];

/** Appointment requests and contact messages — the inbox staff work through. */
export const AdminInbox = () => {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<Tab>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appointmentResult, messageResult] = await Promise.all([
        api.admin.appointments(),
        api.admin.messages(),
      ]);
      setAppointments(appointmentResult.items);
      setMessages(messageResult.items);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('common.errorBody'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAppointmentStatus = async (id: number, status: string) => {
    await api.admin.updateAppointment(id, status);
    await load();
  };

  const setMessageStatus = async (id: number, status: string) => {
    await api.admin.updateMessage(id, status);
    await load();
  };

  const appointmentStatuses = ['requested', 'confirmed', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(['appointments', 'messages'] as Tab[]).map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setTab(entry)}
            className={`border px-4 py-2 text-[13px] transition-colors ${
              tab === entry ? 'border-navy bg-navy text-ivory' : 'border-line bg-paper text-navy hover:border-navy'
            }`}
          >
            {entry === 'appointments' ? t('admin.appointments') : t('admin.messages')}
          </button>
        ))}
      </div>

      {loading ? <Skeleton className="h-64 w-full" /> : null}
      {error ? <p className="text-[14px] text-[#8E3722]">{error}</p> : null}

      {!loading && tab === 'appointments' ? (
        appointments.length === 0 ? (
          <EmptyState title={t('common.noResults')} />
        ) : (
          <ul className="divide-y divide-line border border-line bg-paper">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
                <div>
                  <p className="text-[14px] text-navy">
                    {appointment.fullName} · {formatDigits(appointment.phone, locale)}
                  </p>
                  <p className="mt-1 text-[12px] text-slate">
                    {[appointment.serviceName, appointment.preferredDate, appointment.preferredTime]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {appointment.notes ? (
                    <p className="mt-2 max-w-xl text-[12px] text-slate">{appointment.notes}</p>
                  ) : null}
                  <p className="mt-1 text-[11px] text-slate-light">
                    {formatDate(appointment.createdAt, locale, true)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="border border-line px-2 py-1 text-[11px] uppercase tracking-label text-slate">
                    {appointment.status}
                  </span>
                  <select
                    value={appointment.status}
                    onChange={(event) => void setAppointmentStatus(appointment.id, event.target.value)}
                    className="border border-line bg-ivory px-3 py-2 text-[12px] text-navy"
                  >
                    {appointmentStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {!loading && tab === 'messages' ? (
        messages.length === 0 ? (
          <EmptyState title={t('common.noResults')} />
        ) : (
          <ul className="divide-y divide-line border border-line bg-paper">
            {messages.map((message) => (
              <li key={message.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[14px] text-navy">
                      {message.fullName} · {message.email}
                    </p>
                    <p className="mt-1 text-[12px] text-slate">
                      {[message.subject, message.phone ? formatDigits(message.phone, locale) : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="border border-line px-2 py-1 text-[11px] uppercase tracking-label text-slate">
                      {message.status}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void setMessageStatus(message.id, message.status === 'new' ? 'read' : 'new')}
                    >
                      {message.status === 'new' ? t('action.confirm') : t('action.cancel')}
                    </Button>
                  </div>
                </div>
                <p className="mt-3 max-w-2xl whitespace-pre-line text-[13px] text-slate">{message.message}</p>
                <p className="mt-2 text-[11px] text-slate-light">{formatDate(message.createdAt, locale, true)}</p>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
};
