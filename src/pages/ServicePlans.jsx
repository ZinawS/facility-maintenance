import Button from "../components/UI/Button";

function ServicePlans() {
  const plans = [
    {
      name: "Basic",
      price: "Contact Us",
      features: ["2 Annual Visits", "Discounted Repairs"],
    },
    {
      name: "Silver",
      price: "Contact Us",
      features: ["4 Annual Visits", "Priority Service", "10% Off Repairs"],
    },
    {
      name: "Gold",
      price: "Contact Us",
      features: [
        "6 Annual Visits",
        "24/7 Priority Service",
        "15% Off Repairs",
        "No Overtime Charges",
      ],
    },
  ];

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Service Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className="p-6 bg-white rounded shadow">
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <p className="text-lg mt-2">{plan.price}</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="text-gray-600">
                  • {feature}
                </li>
              ))}
            </ul>
            <Button href="/contact" className="mt-4 block text-center">
              Request Quote
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServicePlans;
