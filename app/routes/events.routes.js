import { checks } from "../middleware/index.js";
import { events_rules } from "../rules/events.rules.js";
import { default_rules } from "../rules/default.rules.js";
import { eventImageMiddleware } from "../middleware/uploads.js";
import {
	addEvent, deleteEvent, rootGetEvent, rootGetEvents, rootSearchEvents, searchEvents, updateEventName,
	updateEventImage, publicGetEvents, publicGetEventSpecifically, publicSearchEvents, updateEventDescription, updateEventDuration, 
	updateEventLocation, updateEventType, publicGetEventsSpecifically, toggleStatus
} from "../controllers/events.controller.js";

export default function (app) {
	app.get("/root/events", [checks.verifyKey, checks.isRootKey], rootGetEvents);
	app.get("/root/search/events", [checks.verifyKey, checks.isRootKey, default_rules.forSearching], rootSearchEvents);
	app.get("/root/event", [checks.verifyKey, checks.isRootKey, events_rules.forFindingEvent], rootGetEvent);

	app.get("/public/events", publicGetEvents);
	app.get("/public/events/via/type", [events_rules.forUpdatingType], publicGetEventsSpecifically);
	app.get("/public/search/events", [default_rules.forSearching], publicSearchEvents);
	app.get("/public/event/stripped", [events_rules.forFindingViaStripped], publicGetEventSpecifically);

	app.post("/root/event/add", [checks.verifyKey, checks.isRootKey, eventImageMiddleware, events_rules.forAdding], addEvent);

	app.put("/root/event/update/name", [checks.verifyKey, checks.isRootKey, events_rules.forFindingEvent, events_rules.forUpdatingName], updateEventName);
	app.put("/root/event/update/type", [checks.verifyKey, checks.isRootKey, events_rules.forFindingEvent, events_rules.forUpdatingType], updateEventType);
	app.put("/root/event/update/location", [checks.verifyKey, checks.isRootKey, events_rules.forFindingEvent, events_rules.forUpdatingLocation], updateEventLocation);
	app.put("/root/event/update/duration", [checks.verifyKey, checks.isRootKey, events_rules.forFindingEvent, events_rules.forUpdatingDuration], updateEventDuration);
	app.put("/root/event/update/description", [checks.verifyKey, checks.isRootKey, events_rules.forFindingEvent, events_rules.forUpdatingDescription], updateEventDescription);
	app.put("/root/event/image", [checks.verifyKey, checks.isRootKey, eventImageMiddleware, events_rules.forFindingEvent], updateEventImage);
	app.put("/root/event/toggle/status", [checks.verifyKey, checks.isRootKey, events_rules.forFindingEventInternal], toggleStatus);

	app.delete("/root/event", [checks.verifyKey, checks.isRootKey, events_rules.forFindingEvent], deleteEvent);
};
