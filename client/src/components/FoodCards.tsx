interface Props {
  foods: string[];
}

export default function FoodCards({ foods }: Props) {
  return (
    <div>

      <h2 className="mb-6 text-3xl font-bold text-[#E78FB3]">
        🍽️ Must Try Foods
      </h2>

      <div className="grid gap-4 md:grid-cols-3">

        {foods.map((food, index) => (

          <div
            key={index}
            className="rounded-3xl border border-pink-100 bg-white p-6 shadow-lg"
          >

            <h3 className="text-xl font-bold">
              {food}
            </h3>

          </div>

        ))}

      </div>

    </div>
  );
}