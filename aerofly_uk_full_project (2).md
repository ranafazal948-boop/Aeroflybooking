# AeroFly UK - Complete Project Codebase & Deployment Guide

> **Application**: AeroFly UK - Domestic Flights & Partner Hub  
> **Theme**: Classic Aviation Yellow & Obsidian Black (`#090d14` & `#FACC15`)  
> **Target Network**: UK Domestic City-to-City Routes (Heathrow, Edinburgh, Manchester, Belfast, Glasgow, Aberdeen, etc.)  
> **Linked Payout Account**: Citibank UK (Beneficiary: Fazal Elahi, Sort: 18-50-08, Account: 54107608, IBAN: GB96CITI18500854107608)  
> **Owner Master Security PIN**: `7860`

---

## 📥 Direct Download Links

* **Full Project ZIP Archive**:  
  `https://ais-dev-wtuka43nptyolu2aszgnjx-141963747478.asia-southeast1.run.app/aerofly-uk.zip`

---

## 📁 Project Architecture & File Inventory

```
aerofly-uk/
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── flight.ts
│   ├── data/
│   │   ├── ukAirports.ts
│   │   └── mockFlights.ts
│   ├── services/
│   │   └── commissionService.ts
│   └── components/
│       ├── Navbar.tsx
│       ├── HeroSearch.tsx
│       ├── FlightResults.tsx
│       ├── BookingModal.tsx
│       ├── BoardingPassModal.tsx
│       ├── OwnerPortalModal.tsx
│       ├── UkRoutesShowcase.tsx
│       └── Footer.tsx
```

---

## 1. `package.json`

```json
{
  "name": "aerofly-uk",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "tsc --noEmit",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-react": "^6.1.1",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "tailwindcss": "^4.3.3",
    "vite": "^8.3.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "typescript": "^7.0.2"
  }
}
```

---

## 2. `vite.config.ts`

```typescript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
});
```

---

## 3. `src/types/flight.ts`

```typescript
export interface Airport {
  code: string;
  name: string;
  city: string;
  region: 'England' | 'Scotland' | 'Northern Ireland' | 'Wales' | 'Crown Dependencies';
  busiestDomesticRank: number;
  terminals: string[];
  runwayHeading: string;
}

export type CabinClass = 'Economy' | 'Premium Economy' | 'Executive Class';

export interface BaggageItem {
  id: string;
  type: 'cabin_standard' | 'standard_hold' | 'heavy_hold' | 'sports_special';
  label: string;
  weightLimitKg: number;
  price: number;
  tagNumber: string;
  trackingStatus: 'Manifest Registered' | 'Tag Printed' | 'Hold Loaded' | 'Baggage Reclaim Belt 2';
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode: string;
  airlineLogoColor: string;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  aircraft: string;
  price: number;
  availableSeats: number;
  terminal: string;
  gate: string;
  baggageAllowance: {
    cabinBagIncluded: boolean;
    cabinKg: number;
    checkedKgIncluded: number;
  };
  carbonEmissionKg: number;
  punctualityRate: number;
}

export interface Passenger {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passportOrId: string;
  checkedBagsCount: number;
  seatNumber: string;
  mealPreference?: string;
  specialAssistance?: boolean;
}

export interface Booking {
  bookingReference: string;
  flight: Flight;
  departureDate: string;
  passengers: Passenger[];
  cabinClass: CabinClass;
  baggageItems: BaggageItem[];
  fareBreakdown: {
    baseFare: number;
    ukAirPassengerDuty: number;
    airportSecurityFee: number;
    baggageFee: number;
    totalAmount: number;
  };
  ownerCommissionEarned: number;
  bookingTimestamp: string;
  status: 'Confirmed' | 'Ticket Issued' | 'Checked In';
  paymentMethod: string;
  affiliateSource: string;
}

export interface OwnerSettings {
  commissionType: 'fixed' | 'percentage';
  fixedCommissionPerTicket: number;
  percentageCommission: number;
  bankDetails: {
    accountHolder: string;
    sortCode: string;
    accountNumber: string;
    bankName: string;
    bankAddress?: string;
    iban: string;
    swiftBic: string;
    paypalEmail: string;
  };
  ownerPin: string;
  ownerEmail: string;
  apiConfig: {
    activeProvider: 'simulated_live' | 'travelpayouts' | 'skyscanner' | 'duffel' | 'amadeus';
    travelpayoutsMarker: string;
    travelpayoutsApiKey: string;
    skyscannerApiKey: string;
    duffelApiToken: string;
    amadeusClientId: string;
    amadeusClientSecret: string;
  };
}

export interface PayoutTransaction {
  id: string;
  date: string;
  amount: number;
  destination: string;
  status: 'Completed' | 'Processing';
  reference: string;
}
```

---

## 4. `src/services/commissionService.ts`

```typescript
import { Booking, OwnerSettings, PayoutTransaction, BaggageItem } from '../types/flight';

const SETTINGS_KEY = 'aerofly_uk_owner_settings';
const BOOKINGS_KEY = 'aerofly_uk_bookings';
const PAYOUTS_KEY = 'aerofly_uk_payouts';

export const DEFAULT_OWNER_SETTINGS: OwnerSettings = {
  commissionType: 'fixed',
  fixedCommissionPerTicket: 14.50,
  percentageCommission: 5.0,
  bankDetails: {
    accountHolder: 'Fazal Elahi',
    sortCode: '18-50-08',
    accountNumber: '54107608',
    bankName: 'Citibank',
    bankAddress: 'Canada Square, Canary Wharf London, E14 5LB United Kingdom',
    iban: 'GB96CITI18500854107608',
    swiftBic: 'CITIGB2L',
    paypalEmail: 'ranafazal948@gmail.com',
  },
  ownerPin: '7860',
  ownerEmail: 'ranafazal948@gmail.com',
  apiConfig: {
    activeProvider: 'simulated_live',
    travelpayoutsMarker: '548921',
    travelpayoutsApiKey: 'tp_uk_live_9812401823',
    skyscannerApiKey: 'sk_live_uk_air_34891',
    duffelApiToken: 'duffel_live_091248102',
    amadeusClientId: 'amad_client_89123',
    amadeusClientSecret: 'amad_sec_991823',
  },
};

const INITIAL_BOOKINGS: Booking[] = [
  {
    bookingReference: 'UK-89214',
    flight: {
      id: 'F-LHR-EDI-BA1432',
      flightNumber: 'BA1432',
      airline: 'British Airways',
      airlineCode: 'BA',
      airlineLogoColor: '#1E3A8A',
      origin: {
        code: 'LHR',
        name: 'London Heathrow Airport',
        city: 'London',
        region: 'England',
        busiestDomesticRank: 1,
        terminals: ['Terminal 5'],
        runwayHeading: '09L/27R',
      },
      destination: {
        code: 'EDI',
        name: 'Edinburgh Airport',
        city: 'Edinburgh',
        region: 'Scotland',
        busiestDomesticRank: 2,
        terminals: ['Main Terminal'],
        runwayHeading: '06/24',
      },
      departureTime: '09:15',
      arrivalTime: '10:35',
      durationMinutes: 80,
      aircraft: 'Airbus A320neo',
      price: 58,
      availableSeats: 9,
      terminal: 'Terminal 5',
      gate: 'A14',
      baggageAllowance: { cabinBagIncluded: true, cabinKg: 7, checkedKgIncluded: 20 },
      carbonEmissionKg: 76,
      punctualityRate: 97,
    },
    departureDate: '2026-10-24',
    passengers: [
      {
        title: 'Mr',
        firstName: 'Oliver',
        lastName: 'Harrison',
        email: 'oliver.h@ukmail.co.uk',
        phone: '+44 7911 123456',
        passportOrId: 'GB9823145',
        checkedBagsCount: 1,
        seatNumber: '04A',
      },
    ],
    cabinClass: 'Economy',
    baggageItems: [
      {
        id: 'BAG-01',
        type: 'standard_hold',
        label: 'Standard Hold Bag (20kg)',
        weightLimitKg: 20,
        price: 24.00,
        tagNumber: 'BA-01258921-A',
        trackingStatus: 'Tag Printed',
      },
    ],
    fareBreakdown: {
      baseFare: 58,
      ukAirPassengerDuty: 7.00,
      airportSecurityFee: 4.50,
      baggageFee: 24.00,
      totalAmount: 93.50,
    },
    ownerCommissionEarned: 14.50,
    bookingTimestamp: '2026-10-20 14:22',
    status: 'Confirmed',
    paymentMethod: 'Mastercard •••• 4412',
    affiliateSource: 'AeroFly Direct Engine',
  },
];

const INITIAL_PAYOUTS: PayoutTransaction[] = [
  {
    id: 'PO-8910',
    date: '2026-10-15',
    amount: 145.00,
    destination: 'Citibank (Sort: 18-50-08 ••••7608)',
    status: 'Completed',
    reference: 'BACS-CITI-COMM-991',
  },
];

export function getOwnerSettings(): OwnerSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.bankDetails || parsed.bankDetails.accountHolder === 'Rana Fazal Travel Holdings' || parsed.bankDetails.bankName === 'Barclays Bank UK PLC') {
        const merged = {
          ...DEFAULT_OWNER_SETTINGS,
          ...parsed,
          bankDetails: DEFAULT_OWNER_SETTINGS.bankDetails,
        };
        saveOwnerSettings(merged);
        return merged;
      }
      return { ...DEFAULT_OWNER_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Could not read owner settings', e);
  }
  return DEFAULT_OWNER_SETTINGS;
}

export function saveOwnerSettings(settings: OwnerSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Could not save owner settings', e);
  }
}

export function getAllBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read bookings', e);
  }
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
  return INITIAL_BOOKINGS;
}

export function addBooking(booking: Booking): void {
  const current = getAllBookings();
  const updated = [booking, ...current];
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Could not save booking', e);
  }
}

export function updateBooking(updatedBooking: Booking): void {
  const current = getAllBookings();
  const index = current.findIndex((b) => b.bookingReference === updatedBooking.bookingReference);
  if (index !== -1) {
    current[index] = updatedBooking;
  } else {
    current.unshift(updatedBooking);
  }
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Could not update booking', e);
  }
}

export function getAllPayouts(): PayoutTransaction[] {
  try {
    const raw = localStorage.getItem(PAYOUTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read payouts', e);
  }
  localStorage.setItem(PAYOUTS_KEY, JSON.stringify(INITIAL_PAYOUTS));
  return INITIAL_PAYOUTS;
}

export function requestPayout(amount: number): PayoutTransaction | null {
  const settings = getOwnerSettings();
  const newPayout: PayoutTransaction = {
    id: `PO-${Date.now().toString().slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
    amount,
    destination: `${settings.bankDetails.bankName || 'UK Bank'} (${settings.bankDetails.sortCode} ••••${settings.bankDetails.accountNumber.slice(-4)})`,
    status: 'Completed',
    reference: `BACS-COMM-${Math.floor(1000 + Math.random() * 9000)}`,
  };

  const current = getAllPayouts();
  const updated = [newPayout, ...current];
  try {
    localStorage.setItem(PAYOUTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Could not save payout', e);
  }
  return newPayout;
}

export function calculateCommissionForTicket(baseFare: number): number {
  const settings = getOwnerSettings();
  if (settings.commissionType === 'percentage') {
    return parseFloat(((baseFare * settings.percentageCommission) / 100).toFixed(2));
  }
  return settings.fixedCommissionPerTicket;
}

export function getFinancialSummary() {
  const bookings = getAllBookings();
  const payouts = getAllPayouts();

  const totalCommissionEarned = bookings.reduce((sum, b) => sum + (b.ownerCommissionEarned || 0), 0);
  const totalPaidOut = payouts.reduce((sum, p) => sum + p.amount, 0);
  const availableBalance = Math.max(0, totalCommissionEarned - totalPaidOut);
  const totalGrossTicketSales = bookings.reduce((sum, b) => sum + (b.fareBreakdown?.totalAmount || 0), 0);

  return {
    totalCommissionEarned: parseFloat(totalCommissionEarned.toFixed(2)),
    totalPaidOut: parseFloat(totalPaidOut.toFixed(2)),
    availableBalance: parseFloat(availableBalance.toFixed(2)),
    totalGrossTicketSales: parseFloat(totalGrossTicketSales.toFixed(2)),
    totalBookingsCount: bookings.length,
    averageCommissionPerBooking: bookings.length > 0 ? parseFloat((totalCommissionEarned / bookings.length).toFixed(2)) : 0,
  };
}
```

---

## 5. `src/App.tsx`

```typescript
import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { FlightResults } from './components/FlightResults';
import { UkRoutesShowcase } from './components/UkRoutesShowcase';
import { BookingModal } from './components/BookingModal';
import { BoardingPassModal } from './components/BoardingPassModal';
import { OwnerPortalModal } from './components/OwnerPortalModal';
import { Footer } from './components/Footer';
import { Flight, Booking, CabinClass } from './types/flight';
import { searchDomesticFlights, getAirportByCode } from './data/mockFlights';
import { getFinancialSummary, getAllBookings } from './services/commissionService';
import { Wallet, ArrowRight } from 'lucide-react';

export default function App() {
  const [originCode, setOriginCode] = useState<string>('LHR');
  const [destinationCode, setDestinationCode] = useState<string>('EDI');
  const [departureDate, setDepartureDate] = useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 2);
    return today.toISOString().split('T')[0];
  });
  const [passengersCount, setPassengersCount] = useState<number>(1);
  const [cabinClass, setCabinClass] = useState<CabinClass>('Economy');

  const [flights, setFlights] = useState<Flight[]>(() =>
    searchDomesticFlights('LHR', 'EDI', departureDate)
  );

  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [activeBoardingPass, setActiveBoardingPass] = useState<Booking | null>(null);
  const [isOwnerPortalOpen, setIsOwnerPortalOpen] = useState<boolean>(false);
  const [financials, setFinancials] = useState(() => getFinancialSummary());

  const [commissionToast, setCommissionToast] = useState<{
    amount: number;
    pnr: string;
    route: string;
  } | null>(null);

  const refreshFinancials = () => {
    setFinancials(getFinancialSummary());
  };

  const handleSearch = () => {
    const results = searchDomesticFlights(originCode, destinationCode, departureDate);
    setFlights(results);
    const resultsElement = document.getElementById('flight-results');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectRouteFromShowcase = (orig: string, dest: string) => {
    setOriginCode(orig);
    setDestinationCode(dest);
    const results = searchDomesticFlights(orig, dest, departureDate);
    setFlights(results);
    const resultsElement = document.getElementById('flight-results');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenMyTickets = () => {
    const all = getAllBookings();
    if (all.length > 0) {
      setActiveBoardingPass(all[0]);
    } else {
      alert('No tickets booked yet. Please search a domestic route and select a flight to book.');
    }
  };

  const handleBookingSuccess = (newBooking: Booking) => {
    setSelectedFlight(null);
    setActiveBoardingPass(newBooking);
    refreshFinancials();

    setCommissionToast({
      amount: newBooking.ownerCommissionEarned,
      pnr: newBooking.bookingReference,
      route: `${newBooking.flight.origin.code} → ${newBooking.flight.destination.code}`,
    });

    setTimeout(() => {
      setCommissionToast(null);
    }, 6000);
  };

  const originAirport = getAirportByCode(originCode);
  const destAirport = getAirportByCode(destinationCode);

  return (
    <div className="min-h-screen bg-[#090d14] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {commissionToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#111724] border-2 border-amber-400 text-white p-4 rounded-2xl shadow-2xl animate-bounce">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Partner Commission Dispatched
                </span>
                <button
                  onClick={() => setCommissionToast(null)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm font-black text-white mt-0.5">
                +£{commissionToast.amount.toFixed(2)} Credited to Owner Account
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Booking Reference {commissionToast.pnr} ({commissionToast.route}) confirmed.
              </p>
              <button
                onClick={() => {
                  setCommissionToast(null);
                  setIsOwnerPortalOpen(true);
                }}
                className="mt-2 text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Access Protected Owner Console</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar
        onOpenOwnerPortal={() => setIsOwnerPortalOpen(true)}
        onOpenMyTickets={handleOpenMyTickets}
        onScrollToSection={handleScrollToSection}
      />

      <main className="flex-1">
        <HeroSearch
          originCode={originCode}
          setOriginCode={setOriginCode}
          destinationCode={destinationCode}
          setDestinationCode={setDestinationCode}
          departureDate={departureDate}
          setDepartureDate={setDepartureDate}
          passengersCount={passengersCount}
          setPassengersCount={setPassengersCount}
          cabinClass={cabinClass}
          setCabinClass={setCabinClass}
          onSearch={handleSearch}
        />

        <FlightResults
          flights={flights}
          originName={originAirport.city}
          destName={destAirport.city}
          departureDate={departureDate}
          onSelectFlight={(flight) => setSelectedFlight(flight)}
        />

        <UkRoutesShowcase onSelectRoute={handleSelectRouteFromShowcase} />
      </main>

      {selectedFlight && (
        <BookingModal
          flight={selectedFlight}
          departureDate={departureDate}
          passengersCount={passengersCount}
          cabinClass={cabinClass}
          onClose={() => setSelectedFlight(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {activeBoardingPass && (
        <BoardingPassModal
          booking={activeBoardingPass}
          onClose={() => setActiveBoardingPass(null)}
          onBookingUpdated={(updated) => {
            setActiveBoardingPass(updated);
            refreshFinancials();
          }}
        />
      )}

      {isOwnerPortalOpen && (
        <OwnerPortalModal
          onClose={() => setIsOwnerPortalOpen(false)}
          onUpdateFinancials={refreshFinancials}
        />
      )}

      <Footer
        onOpenOwnerPortal={() => setIsOwnerPortalOpen(true)}
        onScrollToSection={handleScrollToSection}
      />
    </div>
  );
}
```

---

## 🛠️ Step-by-Step Live Deployment Instructions

### Method 1: Deploy on Vercel (Fastest & 100% Free)
1. Download `aerofly-uk.zip` and extract the files.
2. Go to [https://github.com](https://github.com) and create a new repository (e.g. `aerofly-uk`).
3. Upload all the extracted files to this GitHub repository.
4. Go to [https://vercel.com](https://vercel.com), log in, and click **"Add New Project"**.
5. Select your `aerofly-uk` GitHub repo.
6. Framework Preset will be automatically detected as **Vite**.
7. Click **"Deploy"**. Within 60 seconds, your site will be live on an official HTTPS domain!

### Method 2: Deploy on Netlify
1. Run `npm install` and `npm run build` on your computer.
2. A `dist/` folder will be created.
3. Open [https://app.netlify.com/drop](https://app.netlify.com/drop) and drag-and-drop the `dist` folder.
4. Your website is instantly live!

---
*(Created for Fazal Elahi · AeroFly UK Travel Holdings)*
