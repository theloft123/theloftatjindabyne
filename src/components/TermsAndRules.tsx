export function TermsAndRules() {
  return (
    <section
      id="terms"
      className="scroll-mt-24 rounded-3xl bg-white shadow-sm"
    >
      <div className="p-10 md:p-14">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Important Information
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Terms & House Rules
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Terms and Conditions */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Who can book?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              The Loft @ Jindabyne is available to the host's friends and family. A coupon code will be provided to unlock accommodation availability. The hosts reserve the right to cancel any bookings.
            </p>
          </div>

          {/* House Rules */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">House Rules</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>Check-in: after 1:00 pm</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>Check-out: 11:00 am</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>Self check-in with door code (provided prior to check-in)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>No smoking, no pets, no parties or events</span>
              </li>
            </ul>
          </div>

          {/* Cancellation Policy */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Cancellation Policy
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Guests can cancel until 14 days before check-in for a full refund.
            </p>
          </div>

          {/* The Loft Space */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              The Loft Space
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Access to the loft is via a ladder; we recommend descending backwards and keeping hold of the steps for balance. Because of the steepness of the ladder, we don't recommend younger kids stay upstairs.
            </p>
          </div>

          {/* Linen & Towels */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Linen & Towels
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Please bring your own linen including sheets, pillow cases and towels. Doonas, pillows and blankets are provided and are on the beds.
            </p>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700">
                Bedding Configuration:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span>Bedroom 1: Queen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span>Bedroom 2 (Bunk Room): 1 x Double and 3 x Singles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span>Loft front: Queen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span>Loft back: 2 x Singles</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Ski Gear */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Ski Gear</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              We have a growing collection of kids ski gear which you are welcome to use. It is located in the hallway cupboard. Please ensure any ski gear borrowed is washed, dry and put away ready for the next guests.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              There are also 5 toboggans in the storeroom for snow play.
            </p>
            <p className="mt-3 text-sm font-medium text-slate-700">
              We ask that you not use any of the adult ski gear or skis located throughout the apartment.
            </p>
          </div>

          {/* BBQ */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">BBQ</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              There is a BBQ located around the back of apartment. Walk around the right hand side of the building, and you will see it in the carport on the right hand side. There is a battery operated light above the BBQ. If the gas is running low, please let us know and we will refill when we are next there.
            </p>
          </div>

          {/* Cleaning */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900">Cleaning</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Please give the place a clean before you leave. Cleaning products can be found under the kitchen sink and in the hallway cupboard:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>Clean the main bathroom and toilet upstairs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>Vacuum all carpeted areas and mop all tiled areas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>Empty all bins and remove perishables from the fridge</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>Wipe down all surfaces</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>Clean the kitchen including unstacking the dishwasher and emptying the drying rack</span>
              </li>
            </ul>
            <p className="mt-4 text-sm font-medium text-slate-700">
              Please note that how you leave the apartment is how the next guests will find it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

