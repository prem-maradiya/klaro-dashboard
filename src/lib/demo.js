// Demo data used when the backend is unreachable or has no expenses yet, and
// for the public demo reached from the landing page, so the dashboard always
// looks alive. Replaced by real data when available.

// These dates used to be pinned to May 2026, which meant the demo drifted
// further out of date every month — by November it opened on a six-month-old
// month and looked abandoned. Instead the `day` column below (2..28) is read as
// a position in a rolling 28-day window ending today: day 28 is today, day 2 is
// 26 days ago. The demo therefore always shows the current month, never dates a
// transaction in the future, and usually spans a month boundary, which has the
// side benefit of exercising the month picker and the month-over-month deltas.
const DAY_SPAN = 28;

const mk = (id, merchant, amount, day, hour, min, category, upi, labeled = true) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (DAY_SPAN - day));
  d.setHours(hour, min, 0, 0);
  return {
    id,
    merchant,
    amount,
    date: d.toISOString(),
    raw_sms: `Rs.${amount} debited from a/c XX1234 to VPA ${upi}`,
    upi_id: upi,
    is_labeled: labeled,
    category: labeled ? category : null,
  };
};

const RECENT = [
  mk(1, "Zomato", 486, 28, 20, 42, "Food", "zomato@icici"),
  mk(2, "Blinkit", 724, 28, 13, 10, "Grocery", "blinkit@hdfc"),
  mk(3, "Uber", 212, 27, 21, 5, "Transport", "uber@axis"),
  mk(4, "Swiggy", 398, 27, 14, 18, "Food", "swiggy@ybl"),
  mk(5, "Amazon", 1299, 26, 11, 33, "Shopping", "amazon@apl"),
  mk(6, "Netflix", 649, 25, 9, 0, "Entertainment", "netflix@billdesk"),
  mk(7, "BigBasket", 890, 24, 18, 45, "Grocery", "bigbasket@icici"),
  mk(8, "Rapido", 78, 23, 8, 30, "Transport", "rapido@ybl"),
  mk(9, "Zomato", 312, 22, 21, 12, "Food", "zomato@icici"),
  mk(10, "Myntra", 1850, 21, 16, 20, "Shopping", "myntra@hdfc"),
  mk(11, "Swiggy Instamart", 540, 20, 19, 5, "Grocery", "instamart@ybl"),
  mk(12, "Ola Cabs", 264, 19, 22, 40, "Transport", "ola@paytm"),
  mk(13, "Spotify", 119, 18, 10, 0, "Entertainment", "spotify@billdesk"),
  mk(14, "Zepto", 432, 17, 20, 15, "Grocery", "zepto@axis"),
  mk(15, "Zomato", 528, 16, 13, 50, "Food", "zomato@icici"),
  mk(16, "Electricity Bill", 1420, 15, 11, 0, "Bills", "adanielec@hdfc"),
  mk(17, "Uber", 188, 14, 9, 25, "Transport", "uber@axis"),
  mk(18, "Swiggy", 645, 13, 21, 30, "Food", "swiggy@ybl"),
  mk(19, "Flipkart", 760, 12, 15, 10, "Shopping", "flipkart@axis"),
  mk(20, "Blinkit", 358, 11, 18, 0, "Grocery", "blinkit@hdfc"),
  mk(21, "Zomato", 412, 9, 20, 45, "Food", "zomato@icici"),
  mk(22, "Disney+ Hotstar", 299, 8, 12, 0, "Entertainment", "hotstar@billdesk"),
  mk(23, "Rapido", 95, 7, 8, 50, "Transport", "rapido@ybl"),
  mk(24, "BigBasket", 1120, 6, 17, 30, "Grocery", "bigbasket@icici"),
  mk(25, "Swiggy", 376, 5, 13, 15, "Food", "swiggy@ybl"),
  mk(26, "Amazon", 540, 4, 10, 0, "Shopping", "amazon@apl"),
  mk(27, "Mobile Recharge", 239, 3, 9, 0, "Bills", "jio@billdesk"),
  mk(28, "Zomato", 489, 2, 21, 0, "Food", "zomato@icici"),
  // unlabeled (unknown UPI) — show up in the "Needs labeling" queue
  mk(29, "q41x8s@okaxis", 150, 28, 19, 15, null, "q41x8s@okaxis", false),
  mk(30, "paytmqr281@paytm", 60, 27, 18, 48, null, "paytmqr281@paytm", false),
  mk(31, "9824xxxx12@ybl", 500, 25, 15, 22, null, "9824xxxx12@ybl", false),
];

// A full previous month, shifted back from the rolling window above with
// slightly lighter spending. Without it the previous month holds only the day
// or two the 28-day window happens to reach into, which made the headline read
// a nonsensical "+3015% vs prev month". With it the month picker has two real
// months to switch between and the deltas land on believable numbers.
// Only labeled rows are carried back, so the "needs labeling" queue stays a
// short, current list rather than a pile of month-old items.
const EARLIER = RECENT.filter((e) => e.is_labeled).map((e) => {
  const d = new Date(e.date);
  d.setMonth(d.getMonth() - 1);
  return {
    ...e,
    id: e.id + 100,
    amount: Math.round(e.amount * 0.88),
    date: d.toISOString(),
  };
});

export const DEMO_EXPENSES = [...RECENT, ...EARLIER];
