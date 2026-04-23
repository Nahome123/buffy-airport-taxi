"use client";

import Image from "next/image";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
} from "react";

import { SubmitButton } from "@/components/submit-button";
import { formatCurrencyFromCents } from "@/lib/format";

type BookingFieldErrors = Partial<Record<string, string[]>>;
type AddressSuggestion = { id: string; label: string };

const airportQuickPicks = [
  "Buffalo Niagara International Airport (BUF), Buffalo, NY",
  "Niagara Falls International Airport (IAG), Niagara Falls, NY",
];

const initialState = {
  customerName: "",
  email: "",
  phone: "",
  pickupAddress: "",
  dropoffAddress: "",
  pickupTime: "",
  passengers: "1",
  luggage: "0",
  paymentMethod: "card",
};

export function BookingForm() {
  const [formValues, setFormValues] = useState(initialState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<BookingFieldErrors>({});
  const [isPending, startTransition] = useTransition();
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [estimatedMiles, setEstimatedMiles] = useState<number | null>(null);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null);
  const [routeMapUrl, setRouteMapUrl] = useState<string | null>(null);
  const [pickupSuggestions, setPickupSuggestions] = useState<AddressSuggestion[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<AddressSuggestion[]>([]);
  const [activeField, setActiveField] = useState<"pickupAddress" | "dropoffAddress" | null>(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [estimateMessage, setEstimateMessage] = useState<string | null>(
    "Enter pickup and dropoff addresses to calculate mileage.",
  );
  const [isEstimating, setIsEstimating] = useState(false);
  const pickupFieldRef = useRef<HTMLDivElement | null>(null);
  const dropoffFieldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const pickupAddress = formValues.pickupAddress.trim();
    const dropoffAddress = formValues.dropoffAddress.trim();

    if (pickupAddress.length < 5 || dropoffAddress.length < 5) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsEstimating(true);
      setEstimateMessage("Calculating route distance...");

      try {
        const response = await fetch("/api/fare-estimate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pickupAddress,
            dropoffAddress,
          }),
          signal: controller.signal,
        });

        const result = (await response.json()) as
          | {
              fareCents: number;
              distanceMiles: number;
              durationMinutes: number | null;
              staticMapUrl: string;
            }
          | { error: string };

        if (!response.ok || !("fareCents" in result)) {
          setEstimatedFare(null);
          setEstimatedMiles(null);
          setEstimatedMinutes(null);
          setRouteMapUrl(null);
          setEstimateMessage(
            "We could not estimate mileage right now. You can still submit the booking.",
          );
          return;
        }

        setEstimatedFare(result.fareCents);
        setEstimatedMiles(result.distanceMiles);
        setEstimatedMinutes(result.durationMinutes);
        setRouteMapUrl(result.staticMapUrl);
        setEstimateMessage(null);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setEstimatedFare(null);
        setEstimatedMiles(null);
        setEstimatedMinutes(null);
        setRouteMapUrl(null);
        setEstimateMessage(
          "We could not estimate mileage right now. You can still submit the booking.",
        );
      } finally {
        setIsEstimating(false);
      }
    }, 500);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [formValues.pickupAddress, formValues.dropoffAddress]);

  useEffect(() => {
    const query = formValues.pickupAddress.trim();

    if (query.length < 3) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/address-suggestions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
          signal: controller.signal,
        });

        const result = (await response.json()) as {
          suggestions?: AddressSuggestion[];
        };

        setPickupSuggestions(result.suggestions ?? []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setPickupSuggestions([]);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [formValues.pickupAddress]);

  useEffect(() => {
    const query = formValues.dropoffAddress.trim();

    if (query.length < 3) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/address-suggestions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
          signal: controller.signal,
        });

        const result = (await response.json()) as {
          suggestions?: AddressSuggestion[];
        };

        setDropoffSuggestions(result.suggestions ?? []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setDropoffSuggestions([]);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [formValues.dropoffAddress]);

  const handlePointerDown = useEffectEvent((event: PointerEvent) => {
    const target = event.target as Node;

    if (
      pickupFieldRef.current?.contains(target) ||
      dropoffFieldRef.current?.contains(target)
    ) {
      return;
    }

    setPickupSuggestions([]);
    setDropoffSuggestions([]);
    setActiveField(null);
    setActiveSuggestionIndex(-1);
  });

  useEffect(() => {
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  async function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    setFieldErrors({});

    const payload = {
      customerName: String(formData.get("customerName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      pickupAddress: String(formData.get("pickupAddress") ?? ""),
      dropoffAddress: String(formData.get("dropoffAddress") ?? ""),
      pickupTime: String(formData.get("pickupTime") ?? ""),
      passengers: Number(formData.get("passengers") ?? 1),
      luggage: Number(formData.get("luggage") ?? 0),
      paymentMethod: String(formData.get("paymentMethod") ?? "card"),
    };

    startTransition(async () => {
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = (await response.json()) as
          | { url: string }
          | { error: string; fieldErrors?: BookingFieldErrors };

        if (!response.ok || !("url" in result)) {
          const errorResult =
            "error" in result
              ? result
              : {
                  error: "Unable to continue to checkout.",
                  fieldErrors: {},
                };

          setErrorMessage(errorResult.error);
          setFieldErrors(errorResult.fieldErrors ?? {});
          return;
        }

        window.location.assign(result.url);
      } catch {
        setErrorMessage(
          "We could not start checkout right now. Please try again in a moment.",
        );
      }
    });
  }

  function onFieldChange(name: keyof typeof initialState, value: string) {
    if (name === "pickupAddress" || name === "dropoffAddress") {
      const nextPickupAddress =
        name === "pickupAddress" ? value : formValues.pickupAddress;
      const nextDropoffAddress =
        name === "dropoffAddress" ? value : formValues.dropoffAddress;

      if (name === "pickupAddress" && value.trim().length < 3) {
        setPickupSuggestions([]);
      }

      if (name === "dropoffAddress" && value.trim().length < 3) {
        setDropoffSuggestions([]);
      }

      if (
        nextPickupAddress.trim().length < 5 ||
        nextDropoffAddress.trim().length < 5
      ) {
        setEstimatedFare(null);
        setEstimatedMiles(null);
        setEstimatedMinutes(null);
        setRouteMapUrl(null);
        setEstimateMessage(
          "Enter pickup and dropoff addresses to calculate mileage.",
        );
        setIsEstimating(false);
      }
    }

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function applyAddressSuggestion(
    field: "pickupAddress" | "dropoffAddress",
    value: string,
  ) {
    onFieldChange(field, value);

    if (field === "pickupAddress") {
      setPickupSuggestions([]);
    } else {
      setDropoffSuggestions([]);
    }

    setActiveField(null);
    setActiveSuggestionIndex(-1);
  }

  function getSuggestionsForField(field: "pickupAddress" | "dropoffAddress") {
    const typedValue =
      field === "pickupAddress"
        ? formValues.pickupAddress.trim()
        : formValues.dropoffAddress.trim();
    const liveSuggestions =
      field === "pickupAddress" ? pickupSuggestions : dropoffSuggestions;
    const quickPicks =
      typedValue.length >= 2
        ? airportQuickPicks
            .filter((option) =>
              option.toLowerCase().includes(typedValue.toLowerCase()),
            )
            .map((label) => ({
              id: `quick-${label}`,
              label,
            }))
        : [];

    return [...quickPicks, ...liveSuggestions].filter(
      (suggestion, index, all) =>
        all.findIndex((item) => item.label === suggestion.label) === index,
    );
  }

  function onAddressFocus(field: "pickupAddress" | "dropoffAddress") {
    setActiveField(field);
    setActiveSuggestionIndex(-1);
  }

  function onAddressKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    field: "pickupAddress" | "dropoffAddress",
  ) {
    const suggestions = getSuggestionsForField(field);

    if (suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveField(field);
      setActiveSuggestionIndex((current) =>
        current < suggestions.length - 1 ? current + 1 : 0,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveField(field);
      setActiveSuggestionIndex((current) =>
        current > 0 ? current - 1 : suggestions.length - 1,
      );
    }

    if (event.key === "Enter" && activeSuggestionIndex >= 0) {
      event.preventDefault();
      applyAddressSuggestion(field, suggestions[activeSuggestionIndex].label);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      if (field === "pickupAddress") {
        setPickupSuggestions([]);
      } else {
        setDropoffSuggestions([]);
      }
      setActiveField(null);
      setActiveSuggestionIndex(-1);
    }
  }

  function renderHighlightedSuggestion(label: string, query: string) {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return label;
    }

    const start = label.toLowerCase().indexOf(normalizedQuery.toLowerCase());

    if (start < 0) {
      return label;
    }

    const end = start + normalizedQuery.length;

    return (
      <>
        {label.slice(0, start)}
        <span className="font-semibold text-[var(--color-accent)]">
          {label.slice(start, end)}
        </span>
        {label.slice(end)}
      </>
    );
  }

  const inputClassName =
    "mt-2 w-full rounded-[1.35rem] border border-[var(--color-line)] bg-[#fffaf3] px-4 py-3 text-sm text-[var(--color-copy)] outline-none transition placeholder:text-[#8e7d6d] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[#f3d7c8]";
  const pickupAddressSuggestions = getSuggestionsForField("pickupAddress");
  const dropoffAddressSuggestions = getSuggestionsForField("dropoffAddress");

  return (
    <section className="panel h-full rounded-[2.25rem] border border-[#e8d8c5] p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
            Reserve Your Ride
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--color-copy)]">
            Buffalo pickup planning, dressed up for checkout
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--color-copy-muted)]">
            Share the rider details and we will route the booking into a clean
            Stripe checkout flow with server-side fare pricing.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-[#ecd8c5] bg-[linear-gradient(180deg,#fff7ed,#f5e4d7)] px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Estimated Fare
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-copy)]">
            {estimatedFare !== null
              ? formatCurrencyFromCents(estimatedFare)
              : "--"}
          </p>
          <p className="mt-2 text-xs text-[var(--color-copy-muted)]">
            {estimatedMiles !== null
              ? `${estimatedMiles.toFixed(1)} miles at $2.00 per mile + $10 base`
              : isEstimating
                ? "Calculating mileage..."
                : "Distance estimate pending"}
          </p>
        </div>
      </div>

      <form action={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[var(--color-copy-muted)]">
            Full name
            <input
              className={inputClassName}
              name="customerName"
              type="text"
              autoComplete="name"
              required
              value={formValues.customerName}
              onChange={(event) =>
                onFieldChange("customerName", event.target.value)
              }
            />
            {fieldErrors.customerName?.[0] ? (
              <span className="mt-2 block text-xs text-[var(--color-danger)]">
                {fieldErrors.customerName[0]}
              </span>
            ) : null}
          </label>

          <label className="block text-sm font-medium text-[var(--color-copy-muted)]">
            Email
            <input
              className={inputClassName}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formValues.email}
              onChange={(event) => onFieldChange("email", event.target.value)}
            />
            {fieldErrors.email?.[0] ? (
              <span className="mt-2 block text-xs text-[var(--color-danger)]">
                {fieldErrors.email[0]}
              </span>
            ) : null}
          </label>

          <label className="block text-sm font-medium text-[var(--color-copy-muted)]">
            Phone
            <input
              className={inputClassName}
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={formValues.phone}
              onChange={(event) => onFieldChange("phone", event.target.value)}
            />
            {fieldErrors.phone?.[0] ? (
              <span className="mt-2 block text-xs text-[var(--color-danger)]">
                {fieldErrors.phone[0]}
              </span>
            ) : null}
          </label>

          <label className="block text-sm font-medium text-[var(--color-copy-muted)]">
            Pickup date and time
            <input
              className={inputClassName}
              name="pickupTime"
              type="datetime-local"
              required
              value={formValues.pickupTime}
              onChange={(event) =>
                onFieldChange("pickupTime", event.target.value)
              }
            />
            {fieldErrors.pickupTime?.[0] ? (
              <span className="mt-2 block text-xs text-[var(--color-danger)]">
                {fieldErrors.pickupTime[0]}
              </span>
            ) : null}
          </label>
        </div>

        <fieldset className="rounded-[1.8rem] border border-[#ead8c8] bg-[linear-gradient(180deg,#fbf3ea,#f5e7d8)] p-5">
          <legend className="px-2 text-sm font-medium text-[var(--color-copy-muted)]">
            Payment option
          </legend>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label
              className={`rounded-[1.4rem] border px-4 py-4 transition ${
                formValues.paymentMethod === "card"
                  ? "border-[var(--color-accent)] bg-[#fff8f1] shadow-[0_12px_24px_rgba(126,47,24,0.08)]"
                  : "border-[#e2cfbd] bg-white/70 hover:bg-[#fff8f1]"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={formValues.paymentMethod === "card"}
                onChange={(event) =>
                  onFieldChange("paymentMethod", event.target.value)
                }
                className="sr-only"
              />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                Card Checkout
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--color-copy)]">
                Pay online with Stripe
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-copy-muted)]">
                Continue to secure checkout and pay before the ride is dispatched.
              </p>
            </label>

            <label
              className={`rounded-[1.4rem] border px-4 py-4 transition ${
                formValues.paymentMethod === "cash"
                  ? "border-[var(--color-accent)] bg-[#fff8f1] shadow-[0_12px_24px_rgba(126,47,24,0.08)]"
                  : "border-[#e2cfbd] bg-white/70 hover:bg-[#fff8f1]"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={formValues.paymentMethod === "cash"}
                onChange={(event) =>
                  onFieldChange("paymentMethod", event.target.value)
                }
                className="sr-only"
              />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                Cash Booking
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--color-copy)]">
                Reserve now, pay in cash later
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-copy-muted)]">
                Confirm the trip now and collect payment at pickup or dropoff.
              </p>
            </label>
          </div>
          {fieldErrors.paymentMethod?.[0] ? (
            <span className="mt-3 block text-xs text-[var(--color-danger)]">
              {fieldErrors.paymentMethod[0]}
            </span>
          ) : null}
        </fieldset>

        <label className="block text-sm font-medium text-[var(--color-copy-muted)]">
          Pickup address
          <div ref={pickupFieldRef} className="relative">
            <textarea
              className={`${inputClassName} min-h-24 resize-y`}
              name="pickupAddress"
              required
              value={formValues.pickupAddress}
              onFocus={() => onAddressFocus("pickupAddress")}
              onKeyDown={(event) => onAddressKeyDown(event, "pickupAddress")}
              onChange={(event) =>
                onFieldChange("pickupAddress", event.target.value)
              }
            />
            {pickupAddressSuggestions.length > 0 ? (
              <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-[1.1rem] border border-[#e2cfbd] bg-[#fffaf3] shadow-[0_18px_32px_rgba(43,28,16,0.14)]">
                {pickupAddressSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onMouseEnter={() => {
                      setActiveField("pickupAddress");
                      setActiveSuggestionIndex(index);
                    }}
                    onClick={() =>
                      applyAddressSuggestion("pickupAddress", suggestion.label)
                    }
                    className={`block w-full border-b border-[#f0dfcf] px-4 py-3 text-left text-sm text-[var(--color-copy)] transition last:border-b-0 ${
                      activeField === "pickupAddress" &&
                      activeSuggestionIndex === index
                        ? "bg-[#f2dfce]"
                        : "hover:bg-[#f8ecdf]"
                    }`}
                  >
                    {renderHighlightedSuggestion(
                      suggestion.label,
                      formValues.pickupAddress,
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {fieldErrors.pickupAddress?.[0] ? (
            <span className="mt-2 block text-xs text-[var(--color-danger)]">
              {fieldErrors.pickupAddress[0]}
            </span>
          ) : null}
        </label>

        <label className="block text-sm font-medium text-[var(--color-copy-muted)]">
          Dropoff or airport address
          <div ref={dropoffFieldRef} className="relative">
            <textarea
              className={`${inputClassName} min-h-24 resize-y`}
              name="dropoffAddress"
              required
              value={formValues.dropoffAddress}
              onFocus={() => onAddressFocus("dropoffAddress")}
              onKeyDown={(event) => onAddressKeyDown(event, "dropoffAddress")}
              onChange={(event) =>
                onFieldChange("dropoffAddress", event.target.value)
              }
            />
            {dropoffAddressSuggestions.length > 0 ? (
              <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-[1.1rem] border border-[#e2cfbd] bg-[#fffaf3] shadow-[0_18px_32px_rgba(43,28,16,0.14)]">
                {dropoffAddressSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onMouseEnter={() => {
                      setActiveField("dropoffAddress");
                      setActiveSuggestionIndex(index);
                    }}
                    onClick={() =>
                      applyAddressSuggestion("dropoffAddress", suggestion.label)
                    }
                    className={`block w-full border-b border-[#f0dfcf] px-4 py-3 text-left text-sm text-[var(--color-copy)] transition last:border-b-0 ${
                      activeField === "dropoffAddress" &&
                      activeSuggestionIndex === index
                        ? "bg-[#f2dfce]"
                        : "hover:bg-[#f8ecdf]"
                    }`}
                  >
                    {renderHighlightedSuggestion(
                      suggestion.label,
                      formValues.dropoffAddress,
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {fieldErrors.dropoffAddress?.[0] ? (
            <span className="mt-2 block text-xs text-[var(--color-danger)]">
              {fieldErrors.dropoffAddress[0]}
            </span>
          ) : null}
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[var(--color-copy-muted)]">
            Passengers
            <input
              className={inputClassName}
              name="passengers"
              type="number"
              min={1}
              max={8}
              required
              value={formValues.passengers}
              onChange={(event) =>
                onFieldChange("passengers", event.target.value)
              }
            />
            {fieldErrors.passengers?.[0] ? (
              <span className="mt-2 block text-xs text-[var(--color-danger)]">
                {fieldErrors.passengers[0]}
              </span>
            ) : null}
          </label>

          <label className="block text-sm font-medium text-[var(--color-copy-muted)]">
            Luggage items
            <input
              className={inputClassName}
              name="luggage"
              type="number"
              min={0}
              max={12}
              required
              value={formValues.luggage}
              onChange={(event) => onFieldChange("luggage", event.target.value)}
            />
            {fieldErrors.luggage?.[0] ? (
              <span className="mt-2 block text-xs text-[var(--color-danger)]">
                {fieldErrors.luggage[0]}
              </span>
            ) : null}
          </label>
        </div>

        {errorMessage ? (
          <div className="rounded-[1.35rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {estimateMessage ? (
          <div className="rounded-[1.35rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {estimateMessage}
          </div>
        ) : null}

        {routeMapUrl ? (
          <section className="overflow-hidden rounded-[1.8rem] border border-[#ead8c8] bg-[#f7ede2]">
            <div className="flex items-center justify-between gap-4 border-b border-[#ead8c8] px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                  Route Preview
                </p>
                <p className="mt-1 text-sm text-[var(--color-copy-muted)]">
                  Pickup and dropoff pins are shown on the current driving route.
                </p>
              </div>
              {estimatedMiles !== null ? (
                <p className="text-sm font-semibold text-[var(--color-copy)]">
                  {estimatedMiles.toFixed(1)} miles
                </p>
              ) : null}
            </div>
            <Image
              src={routeMapUrl}
              alt="Map preview showing the current pickup and dropoff route."
              width={900}
              height={420}
              className="h-56 w-full object-cover"
            />
            <div className="grid gap-3 border-t border-[#ead8c8] px-5 py-4 sm:grid-cols-3">
              <div className="rounded-[1.2rem] border border-white/70 bg-white/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-accent)]">
                  Pickup
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-copy)]">
                  {formValues.pickupAddress}
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-white/70 bg-white/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-accent)]">
                  Dropoff
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-copy)]">
                  {formValues.dropoffAddress}
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-white/70 bg-white/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-accent)]">
                  Trip Summary
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-copy)]">
                  {estimatedMiles !== null
                    ? `${estimatedMiles.toFixed(1)} miles`
                    : "Distance pending"}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-copy)]">
                  {estimatedMinutes !== null
                    ? `About ${estimatedMinutes} minutes`
                    : "Travel time pending"}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <div className="grid gap-4 rounded-[1.8rem] border border-[#ead8c8] bg-[linear-gradient(180deg,#f8eee4,#f2e6d8)] p-5 text-sm text-[var(--color-copy-muted)] md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Fare Logic
            </p>
            <p className="mt-2 leading-6">
              Server pricing now uses route distance. Once both addresses are
              entered, the estimate uses live driving mileage, charges $2.00
              per mile, and adds a $10.00 initial fee.
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-white/60 bg-white/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Checkout Mode
            </p>
            <p className="mt-2 leading-6">
              {formValues.paymentMethod === "cash"
                ? "Cash bookings skip Stripe, confirm the ride immediately, and land in the dispatch board with payment still due."
                : "Card bookings continue through Stripe Checkout so the fare is collected before dispatch."}
            </p>
          </div>
        </div>

        <SubmitButton
          idleLabel={
            formValues.paymentMethod === "cash"
              ? "Confirm Cash Booking"
              : "Continue To Secure Checkout"
          }
          pendingLabel={
            isPending
              ? formValues.paymentMethod === "cash"
                ? "Confirming booking..."
                : "Preparing checkout..."
              : "Submitting..."
          }
        />
      </form>
    </section>
  );
}
