interface Props {
  trip: any;
}

export default function TripHero({ trip }: Props) {

  const image =
    `https://picsum.photos/1600/700?random=${trip.destination}`;

  return (
    <div className="overflow-hidden rounded-[35px] bg-white shadow-2xl">

      <img
        src={image}
        alt={trip.destination}
        className="h-[420px] w-full object-cover"
      />

      <div className="p-10">

        <span className="rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-500">
          ✨ AI Recommended Destination
        </span>

        <h1 className="mt-5 text-5xl font-black text-gray-900">
          {trip.destination}
        </h1>

        <h2 className="mt-2 text-2xl text-gray-500">
          📍 {trip.country}
        </h2>

        <p className="mt-8 text-lg leading-8 text-gray-600">
          {trip.overview}
        </p>

      </div>

    </div>
  );
}