export default function Trainers() {
  const TRAINERS = [
    {
      id: 1,
      name: "John Doe",
      specialty: "Strength Training",
      image: "https://images.squarespace-cdn.com/content/v1/659ed09318cd077ef91b5f21/9b25bb97-2a13-4436-9568-714e36484c20/WhatsApp+Image+2024-11-04+at+12.13.46+PM.jpeg",
      featured: false,
      size: "regular"
    },
    {
      id: 2,
      name: "Jane Smith",
      specialty: "Cardio & HIIT",
      image: "https://savannahfitnessexchange.com/wp-content/uploads/2019/04/Screenshot_20221130-152316_Gallery-360x460.jpg",
      featured: false,
      size: "regular"
    },
    {
      id: 3,
      name: "Mike Johnson",
      specialty: "Yoga & Flexibility",
      image: "https://img.freepik.com/premium-photo/gym-membership-personal-trainer-black-man-holding-sign-up-clipboard-heath-wellness-subscription-healthy-lifestyle-portrait-happy-male-coach-holding-paperwork-join-fitness-club_590464-96992.jpg?semt=ais_hybrid&w=740&q=80",
      featured: true,
      size: "large"
    },
    {
      id: 4,
      name: "Emily Davis",
      specialty: "Nutrition & Coaching",
      image: "https://www.essence.com/wp-content/uploads/2018/11/Screen-Shot-2018-11-09-at-11.43.01-AM.png",
      featured: false,
      size: "regular"
    },
    {
      id: 5,
      name: "Alex Carter",
      specialty: "Weightlifting",
      image: "https://smartgyms.co.ke/wp-content/uploads/2019/12/Desmond-500x500.jpg",
      featured: false,
      size: "regular"
    },
    {
      id: 6,
      name: "Sarah Wilson",
      specialty: "CrossFit & Conditioning",
      image: "https://www.uaepersonaltrainers.com/wp-content/uploads/2022/10/Dubai-Female-Personal-Trainer-and-Group-Fitness-Coach-Mary-e1667037675488.jpeg",
      featured: true,
      size: "medium-large"
    },
  ];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 md:px-16">
        {/* Top Row — 3 columns */}
        <div className="flex flex-col lg:flex-row items-start justify-between mb-12 gap-6">
          
          {/* Left — Main Header */}
          <div className="lg:w-1/3 text-left">
            <h1 className="text-4xl font-bold text-orange-500">Trainers</h1>
          </div>

          {/* Center — Subheader */}
          <div className="lg:w-1/3 text-center">
            <p className="text-xl md:text-2xl font-semibold text-black-900">
              Meet our world-class trainers  <br/><span className="text-orange-500">and gym instructors</span>
            </p>
          </div>

          {/* Right — Brief Description */}
          <div className="lg:w-1/3 text-right">
            <p className="text-black-700">
              Our certified trainers are dedicated to helping you achieve your fitness goals safely and effectively. With years of experience and personalized coaching, they'll guide you every step of the way.
            </p>
          </div>
        </div>

       {/* Staggered Masonry Grid */}
<div className="grid grid-cols-6 gap-4 auto-rows-[minmax(250px,auto)]">

  {/* Trainer 1 - Pinned Photo Style */}
  <div className="flex flex-col items-center">
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-orange transition-shadow h-48 w-full">
      <img
        src={TRAINERS[0].image}
        alt={TRAINERS[0].name}
        className="w-full h-full object-cover"
      />
    </div>
    <h3 className="text-sm font-bold mt-3 text-black-900">{TRAINERS[0].name}</h3>
    <p className="text-orange-500 font-semibold text-xs">{TRAINERS[0].specialty}</p>
  </div>

  {/* Trainer 2 - Regular */}
  <div className="flex flex-col items-center">
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-orange transition-shadow h-48 w-full">
      <img src={TRAINERS[1].image} alt={TRAINERS[1].name} className="w-full h-full object-cover" />
    </div>
    <h3 className="text-sm font-bold mt-3 text-black-900">{TRAINERS[1].name}</h3>
    <p className="text-orange-500 font-semibold text-xs">{TRAINERS[1].specialty}</p>
  </div>

  {/* Trainer 3 - Featured (Larger) */}
  <div className="relative flex items-start">
    {/* Image */}
    <div className="bg-gradient-orange rounded-xl shadow-lg overflow-hidden hover:shadow-orange transition-shadow h-80 w-full">
      <img
        src={TRAINERS[2].image}
        alt={TRAINERS[2].name}
        className="w-full h-full object-cover"
      />
    </div>

    {/* Text — Right side, positioned above Trainers 4 & 5 */}
    <div className="absolute left-full ml-4 top-10 text-left">
      <h3 className="text-sm font-bold text-black-900 whitespace-nowrap">
        {TRAINERS[2].name}
      </h3>
      <p className="text-orange-500 font-semibold text-xs whitespace-nowrap">
        {TRAINERS[2].specialty}
      </p>
    </div>
  </div>

  {/* Trainer 4 - Regular (below Trainer 3’s text) */}
  <div className="flex flex-col items-center mt-32">
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-orange transition-shadow h-48 w-full">
      <img src={TRAINERS[3].image} alt={TRAINERS[3].name} className="w-full h-full object-cover" />
    </div>
    <h3 className="text-sm font-bold mt-3 text-black-900">{TRAINERS[3].name}</h3>
    <p className="text-orange-500 font-semibold text-xs">{TRAINERS[3].specialty}</p>
  </div>

  {/* Trainer 5 - Regular (aligned with Trainer 4) */}
  <div className="flex flex-col items-center mt-32">
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-orange transition-shadow h-48 w-full">
      <img src={TRAINERS[4].image} alt={TRAINERS[4].name} className="w-full h-full object-cover" />
    </div>
    <h3 className="text-sm font-bold mt-3 text-black-900">{TRAINERS[4].name}</h3>
    <p className="text-orange-500 font-semibold text-xs">{TRAINERS[4].specialty}</p>
  </div>

  {/* Trainer 6 - Secondary Featured (Larger) */}
  <div className="flex flex-col items-center">
    <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg overflow-hidden hover:shadow-orange transition-shadow h-56 w-full">
      <img src={TRAINERS[5].image} alt={TRAINERS[5].name} className="w-full h-full object-cover border-4 border-white" />
    </div>
    <h3 className="text-sm font-bold mt-3 text-black-900">{TRAINERS[5].name}</h3>
    <p className="text-orange-500 font-semibold text-xs">{TRAINERS[5].specialty}</p>
  </div>

</div>

      </div>
    </div>
  );
}