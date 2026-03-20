import { eventData } from '../data/eventData';
import { previewEventData } from '../data/previewData';
import { useIsPreview } from '../PreviewContext';

export default function EventBanner() {
  const isPreview = useIsPreview();
  const data = isPreview ? previewEventData : eventData;

  return (
    <div className="pt-9 pb-0">
      {/* Hero Banner */}
      <div className="h-[164px] rounded-lg relative overflow-hidden">
        {isPreview ? (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-icon-bg)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Event Banner Image</span>
          </div>
        ) : (
          <img
            src="https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=1200&h=300&fit=crop&crop=center"
            alt="Youth hockey tournament banner"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Event Info */}
      <div className="pt-6 pb-4">
        <h2 className="text-[42px] font-bold leading-[48px]" style={{ color: 'var(--color-text-heading)' }}>{data.title}</h2>
        <p className="text-xl font-medium mt-1" style={{ color: 'var(--color-text-secondary)' }}>{data.associationName}</p>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>Owner: </span>{data.owner}
        </p>
      </div>

      {/* Three-column info */}
      <div className="flex items-start gap-10 pb-8">
        {/* Date */}
        <div className="flex-1 flex items-start gap-4">
          <div className="w-[45px] h-[45px] rounded-[6px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-icon-bg)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-icon-stroke)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Date</p>
            <p className="text-sm leading-[18px]" style={{ color: 'var(--color-text-primary)' }}>{data.date}</p>
            <button className="text-sm hover:underline mt-0.5" style={{ color: 'var(--color-link)' }}>Add to Calendar</button>
          </div>
        </div>

        <div className="w-px self-stretch rounded-full" style={{ backgroundColor: 'var(--color-divider)' }} />

        {/* Location */}
        <div className="flex-1 flex items-start gap-4">
          <div className="w-[45px] h-[45px] rounded-[6px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-icon-bg)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-icon-stroke)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Location</p>
            <p className="text-sm leading-[18px]" style={{ color: 'var(--color-text-primary)' }}>{data.location.venue}:</p>
            <p className="text-sm leading-[18px]" style={{ color: 'var(--color-text-primary)' }}>{data.location.address}</p>
            <button className="text-sm hover:underline mt-0.5" style={{ color: 'var(--color-link)' }}>Get Directions</button>
          </div>
        </div>

        <div className="w-px self-stretch rounded-full" style={{ backgroundColor: 'var(--color-divider)' }} />

        {/* Payment Options */}
        <div className="flex-1 flex items-start gap-4">
          <div className="w-[45px] h-[45px] rounded-[6px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-icon-bg)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-icon-stroke)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="6" x2="12" y2="18" />
              <path d="M9 10.5c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2s-.9 2-2 2h-2c-1.1 0-2 .9-2 2s.9 2 2 2h2c1.1 0 2-.9 2-2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Payment Options</p>
            <p className="text-sm leading-[18px]" style={{ color: 'var(--color-text-primary)' }}>{data.paymentOptions.join(', ')}</p>
            <p className="text-sm font-medium mt-2" style={{ color: 'var(--color-text-primary)' }}>Payment Plans available:</p>
            <p className="text-sm leading-[18px]" style={{ color: 'var(--color-text-primary)' }}>{data.paymentPlans.join(', ')}</p>
          </div>
        </div>
      </div>

      {/* Divider before tabs */}
      <hr style={{ borderColor: 'var(--color-divider)' }} />
    </div>
  );
}
