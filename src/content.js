import { money } from './format.js'

export const PRICE = 150
export const WEEKS_PER_MONTH = 4.3

export const nav = [
  { to: '/service', label: 'The service' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/questions', label: 'Questions' },
]

export const trades = [
  'Plumbing',
  'HVAC',
  'Dental',
  'Salons',
  'Veterinary',
  'Auto repair',
  'Legal intake',
  'Med spa',
  'Cleaning',
  'Electrical',
  'Landscaping',
  'Chiropractic',
]

export const day = [
  {
    time: '7.12 a.m.',
    title: 'Before the trucks roll',
    body: 'A no-cool call comes in while the shop is still opening. DeskAgent books 10.40 a.m. and the route starts full.',
  },
  {
    time: '11.03 a.m.',
    title: 'Both techs are in attics',
    body: 'A maintenance visit is set for Thursday at 9.00. Nobody climbs down to catch the telephone.',
  },
  {
    time: '3.26 p.m.',
    title: 'Overflow in the afternoon',
    body: 'An estimate request lands while both jobs are still running. 5.10 p.m. goes on the book.',
  },
  {
    time: '9.18 p.m.',
    title: 'The shop is dark',
    body: 'A leaking unit gets the first morning slot, 8.00 a.m. The caller hangs up with a time, rather than a voicemail tone.',
  },
]

export const industryCards = [
  { name: 'Plumbing', books: 'Leaks, installs, and estimates' },
  { name: 'HVAC', books: 'No-cool visits, maintenance, replacements' },
  { name: 'Dental', books: 'New patients, cleanings, follow-ups' },
  { name: 'Salons & spas', books: 'Cuts, colour, and longer treatments' },
  { name: 'Veterinary', books: 'Sick visits, vaccines, checkups' },
  { name: 'Auto repair', books: 'Drop-off windows and diagnostics' },
  { name: 'Legal intake', books: 'Consultation times' },
  { name: 'Wellness', books: 'Adjustments, intros, and sessions' },
]

export const industryOptions = [
  'Plumbing',
  'HVAC',
  'Dental or medical',
  'Salon or spa',
  'Veterinary',
  'Auto repair',
  'Legal intake',
  'Cleaning',
  'Electrical',
  'Landscaping',
  'Chiropractic or wellness',
  'Another service business',
]

export const steps = [
  {
    n: '01',
    title: 'Keep your number',
    body: 'Customers keep calling the line on your truck, your site, and your door. Forward the calls you want DeskAgent to take.',
  },
  {
    n: '02',
    title: 'Teach it your book',
    body: 'Add services, how long they take, the windows you can honour, your service area, and the requests that should come straight to you.',
  },
  {
    n: '03',
    title: 'Take the appointment',
    body: 'DeskAgent books inside those windows and sends you who called, what they needed, and the time now on your book.',
  },
]

export const objections = [
  {
    q: 'Voicemail already catches the overflow.',
    a: 'A recording waits for a callback. DeskAgent has the conversation and makes the appointment while the customer is still on the line.',
  },
  {
    q: 'Our customers want a person.',
    a: 'Routine booking is a clear conversation. When a request needs your judgment, DeskAgent collects the details and hands you the brief.',
  },
  {
    q: 'The work is too specific.',
    a: 'You set the services, the questions, and the limits. DeskAgent books only what you allow and describes the visit the way you would.',
  },
  {
    q: `${money(PRICE)} is still another bill.`,
    a: `The pricing page will take your missed calls and the value of a job. If one recovered appointment is worth more than ${money(PRICE)}, a single booking covers the month.`,
  },
]

export const capabilities = [
  {
    id: 'answer',
    visual: 'wave',
    title: 'Answers the call',
    body: 'When the line rings and you are with a client, on a roof, or away from the desk, DeskAgent takes the conversation.',
  },
  {
    id: 'book',
    visual: 'slip',
    title: 'Makes the appointment',
    body: 'It offers times inside the windows you set and books the one the caller accepts.',
  },
  {
    id: 'knows',
    visual: 'chips',
    title: 'Knows the work',
    body: 'Services, duration, hours, service area, and the jobs you will and will not schedule.',
  },
  {
    id: 'hours',
    visual: 'always',
    title: 'Covers the off hours',
    body: 'Lunch, the middle of a job, evenings, and the closed sign stay covered.',
  },
  {
    id: 'brief',
    visual: 'brief',
    title: 'Leaves you the brief',
    body: 'Who called, what they needed, and the appointment that was made.',
  },
  {
    id: 'handoff',
    visual: 'handoff',
    title: 'Brings you in when it should',
    body: 'Anything outside your rules comes to you with the caller’s request and how to reach them.',
  },
]

export const included = [
  'Answers customer calls',
  'Holds a real conversation',
  'Makes appointments in your open windows',
  'Covers the line when you can’t',
  'Sends a brief of what was booked',
]

export const faqs = [
  {
    q: 'What does DeskAgent do on a call?',
    a: 'It greets the caller, asks what they need, checks the services and hours you set, and books an appointment when the request fits. You get a brief of the call and the booking.',
  },
  {
    q: `What is included for ${money(PRICE)} a month?`,
    a: 'Call answering, the conversation with your customer, and appointment making inside the windows you set. One monthly price.',
  },
  {
    q: 'Do customers have to learn a new number?',
    a: 'They call the number you already publish. You forward the calls you want DeskAgent to answer.',
  },
  {
    q: 'How does it know when we are free?',
    a: 'You give it bookable windows, how long each service takes, and how far ahead you are willing to schedule. It books inside those rules.',
  },
  {
    q: 'What if the request is unusual?',
    a: 'You set the boundary. Calls outside it are written up and sent to you with the details a person needs to take over.',
  },
  {
    q: 'Which businesses is this for?',
    a: 'Service businesses that win work by phone and book a time to do it: trades, clinics, salons, studios, shops, and professional offices.',
  },
  {
    q: 'Does it answer after we close?',
    a: 'Yes. The line stays answered when the shop is closed, at lunch, and while you are with someone else.',
  },
  {
    q: 'Can we hear the shape of a call first?',
    a: 'Speak with Sophie on the front page. She answers questions about how DeskAgent would take your calls. Your own line uses your services, your hours, and your wording.',
  },
]

export const paths = [
  {
    id: 'voicemail',
    title: 'Voicemail',
    body: 'A recording, if the caller stays on the line long enough to leave one.',
  },
  {
    id: 'hire',
    title: 'Front-desk hire',
    body: 'A person covering the hours you can staff.',
  },
  {
    id: 'desk',
    title: 'DeskAgent',
    body: `Answers and books the appointment. ${money(PRICE)} a month.`,
    featured: true,
  },
]
