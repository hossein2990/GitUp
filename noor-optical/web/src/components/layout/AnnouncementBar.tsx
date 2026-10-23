import { Link } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';
import { useSettings } from '../../lib/settings';
import { ChevronIcon } from '../ui/Icons';

/**
 * Announcement strip above the header. Copy, link and visibility come from the
 * admin panel, so promotions can change without a deploy.
 */
export const AnnouncementBar = () => {
  const settings = useSettings();
  const { pick } = useI18n();
  const announcement = settings.announcement;

  if (!announcement.enabled) return null;
  const text = pick(announcement.textFa, announcement.textEn);
  if (!text) return null;

  const content = (
    <span className="flex items-center justify-center gap-2">
      <span className="hidden h-[5px] w-[5px] rounded-full bg-champagne sm:block" aria-hidden />
      {text}
      {announcement.href ? <ChevronIcon direction="end" size={14} className="flip-rtl" /> : null}
    </span>
  );

  return (
    <div className="bg-navy-deep text-ivory">
      <div className="mx-auto flex max-w-[1600px] items-center justify-center px-4 py-2 text-center text-[11px] uppercase tracking-label">
        {announcement.href ? (
          <Link to={announcement.href} className="transition-colors hover:text-champagne">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </div>
  );
};
