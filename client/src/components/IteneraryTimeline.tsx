interface Props {
  itinerary: any[];
}

export default function ItineraryTimeline({ itinerary }: Props) {
  return (
    <div>

      <h2 className="mb-8 text-3xl font-bold text-[#E78FB3]">
        📅 Suggested Itinerary
      </h2>

      <div className="relative border-l-4 border-pink-200 pl-8">

        {itinerary.map((day, index) => (

          <div key={index} className="relative mb-10">

            <div className="absolute -left-[42px] flex h-8 w-8 items-center justify-center rounded-full bg-[#E78FB3] text-white font-bold">
              {index + 1}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg border border-pink-100">

              <p className="text-sm font-semibold text-[#E78FB3]">
                {day.day}
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                {day.title}
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                {day.description}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}