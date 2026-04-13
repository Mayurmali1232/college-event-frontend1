import { useEffect, useState } from "react";
import { API } from "../api/axios";
// import { API } from "../api";

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    API.get("/events").then(res => setEvents(res.data));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Events</h2>
      {events.length === 0 ? <p>No Data Found</p> : (
        <div className="grid grid-cols-3 gap-4">
          {events.map(e => (
            <div key={e.id} className="p-4 shadow rounded-2xl">
              <h3>{e.title}</h3>
              <p>{e.location}</p>
              <img src={e.imageUrl} alt="event" className="w-full h-40 object-cover rounded-xl"
/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
