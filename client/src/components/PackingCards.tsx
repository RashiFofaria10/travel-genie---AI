interface Props {
  packing: string[];
}

export default function PackingCards({ packing }: Props) {
  return (
    <section>

      <h2 className="mb-6 text-3xl font-bold text-[#E78FB3]">
        🎒 Packing Checklist
      </h2>

      <div className="grid gap-6 md:grid-cols-3">

        {packing.map((item, index) => (

          <div
            key={index}
            className="
              rounded-3xl
              border
              border-pink-100
              bg-white
              p-6
              shadow-lg
              transition
              hover:-translate-y-1
              hover:shadow-xl
            "
          >

            <div className="flex items-center gap-4">

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-pink-50
                  text-2xl
                "
              >
                🎒
              </div>

              <div>

                <h3 className="font-bold text-gray-800">
                  Essential Item
                </h3>

                <p className="mt-1 text-gray-600">
                  {item}
                </p>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}