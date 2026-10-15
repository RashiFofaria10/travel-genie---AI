interface Props {
  hotels: any[];
}

export default function HotelCards({ hotels }: Props) {
  return (
    <div>

      <h2 className="mb-6 text-3xl font-bold text-[#E78FB3]">
        🏨 Recommended Hotels
      </h2>

      <div className="grid gap-6 md:grid-cols-3">

        {hotels.map((hotel, index) => (

          <div
            key={index}
            className="rounded-3xl border border-pink-100 bg-white p-6 shadow-lg"
          >

            <h3 className="text-xl font-bold">
              {hotel.name}
            </h3>

            <p className="mt-4 text-gray-600">
              💰 {hotel.price}
            </p>

            <p className="mt-2 text-yellow-500 font-semibold">
              ⭐ {hotel.rating}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}