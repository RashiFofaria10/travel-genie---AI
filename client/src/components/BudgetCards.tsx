interface Props {
  budget: any;
}

export default function BudgetCards({ budget }: Props) {
  return (
    <div>

      <h2 className="text-3xl font-bold text-[#E78FB3] mb-6">
        💰 Estimated Budget
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">

        <div className="rounded-3xl bg-pink-50 p-6 shadow-lg">
          <h3 className="font-bold">✈ Flights</h3>
          <p className="mt-3">{budget.flights}</p>
        </div>

        <div className="rounded-3xl bg-pink-50 p-6 shadow-lg">
          <h3 className="font-bold">🏨 Hotel</h3>
          <p className="mt-3">{budget.hotel}</p>
        </div>

        <div className="rounded-3xl bg-pink-50 p-6 shadow-lg">
          <h3 className="font-bold">🍽 Food</h3>
          <p className="mt-3">{budget.food}</p>
        </div>

        <div className="rounded-3xl bg-pink-50 p-6 shadow-lg">
          <h3 className="font-bold">🚕 Transport</h3>
          <p className="mt-3">{budget.transport}</p>
        </div>

        <div className="rounded-3xl bg-[#E78FB3] text-white p-6 shadow-lg">
          <h3 className="font-bold">💵 Total</h3>
          <p className="mt-3 font-bold">{budget.total}</p>
        </div>

      </div>

    </div>
  );
}