import { Button } from '@eventconnect/dec';
import { eventData } from '../data/eventData';
import { previewEventData } from '../data/previewData';
import { useIsPreview } from '../PreviewContext';

export default function DetailsPage() {
  const isPreview = useIsPreview();
  const data = isPreview ? previewEventData : eventData;

  return (
    <div className="py-8">
      <section>
        <h3 className="text-[28px] font-medium leading-8 mb-4" style={{ color: 'var(--color-text-heading)' }}>Details</h3>
        <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Welcome To {data.title}.</h4>
        <p className="text-sm leading-5 mb-4" style={{ color: 'var(--color-text-secondary)' }}>{data.details.welcome}</p>
        <p className="text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>OUR GOAL</p>
        <p className="text-sm leading-5 mb-4" style={{ color: 'var(--color-text-secondary)' }}>{data.details.goal}</p>
        <p className="text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>WHAT'S NEXT?</p>
        <p className="text-sm leading-5" style={{ color: 'var(--color-text-secondary)' }}>{data.details.whatsNext}</p>
      </section>

      <hr className="my-8" style={{ borderColor: 'var(--color-divider)' }} />

      <section>
        <h3 className="text-[28px] font-medium leading-8 mb-4" style={{ color: 'var(--color-text-heading)' }}>Rules & Regulations</h3>
        <div className="text-sm leading-5 whitespace-pre-line" style={{ color: 'var(--color-text-secondary)' }}>{data.rulesAndRegulations}</div>
      </section>

      <hr className="my-8" style={{ borderColor: 'var(--color-divider)' }} />

      <section>
        <h3 className="text-[28px] font-medium leading-8 mb-4" style={{ color: 'var(--color-text-heading)' }}>Payment Info</h3>
        <p className="text-sm leading-5" style={{ color: 'var(--color-text-secondary)' }}>{data.paymentInfo}</p>
      </section>

      <hr className="my-8" style={{ borderColor: 'var(--color-divider)' }} />

      <section>
        <h3 className="text-[28px] font-medium leading-8 mb-4" style={{ color: 'var(--color-text-heading)' }}>Accommodations</h3>
        <p className="text-sm leading-5 mb-6" style={{ color: 'var(--color-text-secondary)' }}>{data.accommodations}</p>
        <div className="text-center mb-6">
          <p className="text-sm font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>Click here to register to this event!</p>
          <Button variant="destructive">New Registration</Button>
        </div>
        <div className="w-full h-72 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-map-bg)' }}>
          <div className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <p className="text-sm">Map — {data.location.venue}, {data.location.address.split(',').slice(-2).join(',').trim()}</p>
          </div>
        </div>
      </section>

      <hr className="my-8" style={{ borderColor: 'var(--color-divider)' }} />

      <section>
        <h3 className="text-[28px] font-medium leading-8 mb-2" style={{ color: 'var(--color-text-heading)' }}>Sponsors</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>Here are our sponsors.</p>
        <div className="flex items-center gap-6">
          {data.sponsors.map((s) => (
            <div key={s.name} className="w-16 h-16 rounded-lg flex items-center justify-center text-xs font-medium" style={{ backgroundColor: 'var(--color-sponsor-bg)', color: 'var(--color-text-secondary)' }}>{s.logo}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
