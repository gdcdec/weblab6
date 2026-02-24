import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import dotenv from 'dotenv';
import { eventModel, Category } from '@models/eventModel.js';
import User from '@models/userModel.js';

dotenv.config();

interface EventParams {
  eventId?: string;
  eventCat?: string;
}

interface EventBody {
  title?: string;
  description?: string;
  date?: string;
  createdBy?: number;
  category?: Category;
}

/**
 * @swagger
 * /events:
 *   get:
 *     tags: [Public]
 *     summary: Retrieve all events
 *     responses:
 *       200:
 *         description: A list of all events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/events'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "An unexpected error occurred"
 */
const getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const events = await eventModel.findAll();
    res.status(200).json(events);
  } catch (e) {
    next(e);
  }
};

/**
 * @swagger
 * /events/id/{eventId}:
 *   get:
 *     tags: [Public]
 *     summary: Get a specific event by ID
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Numeric ID of the event to retrieve
 *         example: 1
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/events'
 *       400:
 *         description: Event not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Event No. 1 not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "An unexpected error occurred"
 */
const getEventById = async (req: Request<EventParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { eventId } = req.params;
    const event = await eventModel.findOne({
      where: { id: eventId },
      include: [{ model: User, attributes: ['id', 'name'] }],
    });

    if (!event) {
      res.status(400).json({ message: `Event No. ${eventId} not found` });
      return;
    }

    res.status(200).json(event);
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /events/cat/{eventCat}:
 *   get:
 *     tags: [Public]
 *     summary: Get events by category
 *     parameters:
 *       - in: path
 *         name: eventCat
 *         required: true
 *         schema:
 *           type: string
 *           enum: [education, amusement, work, hobby, other]
 *         description: Category of events to retrieve
 *         example: education
 *     responses:
 *       200:
 *         description: List of events in the specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/events'
 *       400:
 *         description: Illegal category or no events found
 *         content:
 *           application/json:
 *             examples:
 *               illegalCategory:
 *                 summary: Illegal category
 *                 value:
 *                   message: "Illegal category -- 'invalid'"
 *               noEvents:
 *                 summary: No events found in category
 *                 value:
 *                   message: "Events with category 'education' not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "An unexpected error occurred"
 */
const getEventByCat = async (req: Request<EventParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { eventCat } = req.params;
    const events = await eventModel.findAll({
      where: { category: eventCat },
      include: [{ model: User, attributes: ['id', 'name'] }],
    });

    if (!events.length) {
      res.status(400).json({ message: `Events with category '${eventCat}' not found` });
      return;
    }

    res.status(200).json(events);
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /events:
 *   post:
 *     tags: [Private]
 *     summary: Create a new event
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - createdBy
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the event
 *                 example: "Tech Conference 2024"
 *               description:
 *                 type: string
 *                 description: Optional description
 *                 example: "Annual tech conference"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the event
 *                 example: "2024-05-15T09:00:00.000Z"
 *               createdBy:
 *                 type: integer
 *                 description: ID of the user creating the event
 *                 example: 1
 *               category:
 *                 type: string
 *                 enum: [education, amusement, work, hobby, other]
 *                 description: Category of the event
 *                 example: "education"
 *           examples:
 *             validEvent:
 *               summary: Valid event creation
 *               value:
 *                 title: "Tech Conference 2024"
 *                 description: "Annual technology conference"
 *                 date: "2024-05-15T09:00:00.000Z"
 *                 createdBy: 1
 *                 category: "education"
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/events'
 *       400:
 *         description: Bad request – missing fields, illegal category, or invalid date format
 *         content:
 *           application/json:
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   message: "Fields 'title', 'date', 'createdBy', 'category' required"
 *               illegalCategory:
 *                 summary: Illegal category
 *                 value:
 *                   message: "Illegal category -- 'invalid'"
 *               invalidDate:
 *                 summary: Invalid date format
 *                 value:
 *                   message: "Invalid date format, required YYYY-MM-DDTHH:mm:ss.sssZ"
 *       403:
 *         description: Daily creation limit exceeded
 *         content:
 *           application/json:
 *             example:
 *               message: "Daily creation limit of '10' has been reached. Count is 12"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "An unexpected error occurred"
 */
const createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, date, createdBy, category } = req.body as EventBody;
    const dailyLimit = parseInt(process.env.DAILY_LIMIT as string, 10);

    if (!title || !date || !createdBy || !category) {
      res.status(400).json({
        message: "Fields 'title', 'date', 'createdBy', 'category' required",
      });
      return;
    }

    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      res.status(400).json({
        message: 'Invalid date format, required YYYY-MM-DDTHH:mm:ss.sssZ',
      });
      return;
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Explicitly type count as number to avoid overload ambiguity
    const count: number = await eventModel.count({
      where: {
        createdAt: { [Op.gte]: twentyFourHoursAgo }
      }
    });

    if (count > dailyLimit) {
      res.status(403).json({
        message: `Daily creation limit of '${dailyLimit}' has been reached. Count is ${count}`,
      });
      return;
    }

    const event = await eventModel.create({
      title,
      description,
      date: eventDate,
      createdBy,
      category,
    });

    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /events/id/{eventId}:
 *   put:
 *     tags: [Private]
 *     summary: Update an existing event
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Numeric ID of the event to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated title
 *                 example: "Updated Tech Conference"
 *               description:
 *                 type: string
 *                 description: Updated description
 *                 example: "Updated description"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Updated date
 *                 example: "2024-06-01T10:00:00.000Z"
 *               createdBy:
 *                 type: integer
 *                 description: Updated creator ID
 *                 example: 2
 *               category:
 *                 type: string
 *                 enum: [education, amusement, work, hobby, other]
 *                 description: Updated category
 *                 example: "work"
 *           examples:
 *             updateEvent:
 *               summary: Update event fields
 *               value:
 *                 title: "Updated Tech Conference"
 *                 date: "2024-06-01T10:00:00.000Z"
 *                 category: "work"
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/events'
 *       400:
 *         description: Event not found or invalid date format
 *         content:
 *           application/json:
 *             examples:
 *               notFound:
 *                 summary: Event not found
 *                 value:
 *                   message: "Event 1 not found"
 *               invalidDate:
 *                 summary: Invalid date format
 *                 value:
 *                   message: "Invalid date format, required YYYY-MM-DDTHH:mm:ss.sssZ"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "An unexpected error occurred"
 */
const updateEvent = async (req: Request<EventParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { title, description, date, createdBy, category } = req.body as EventBody;

    let eventDate: Date | null = null;
    if (date) {
      eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        res.status(400).json({
          message: 'Invalid date format, required YYYY-MM-DDTHH:mm:ss.sssZ',
        });
        return;
      }
    }

    const event = await eventModel.findOne({ where: { id: eventId } });
    if (!event) {
      res.status(400).json({ message: `Event ${eventId} not found` });
      return;
    }

    event.title = title ?? event.title;
    event.description = description ?? event.description;
    event.date = eventDate ?? event.date;
    event.createdBy = createdBy ?? event.createdBy;
    event.category = category ?? event.category;
    await event.save();

    res.status(200).json(event);
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /events/id/{eventId}:
 *   delete:
 *     tags: [Private]
 *     summary: Delete an event
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Numeric ID of the event to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Event deleted successfully (no content)
 *       400:
 *         description: Event not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Event No. 1 not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "An unexpected error occurred"
 */
const deleteEvent = async (req: Request<EventParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { eventId } = req.params;
    const event = await eventModel.findOne({ where: { id: eventId } });

    if (!event) {
      res.status(400).json({ message: `Event No. ${eventId} not found` });
      return;
    }

    await event.destroy();
    res.status(200).send();
  } catch (err) {
    next(err);
  }
};

export { getEvents, getEventById, getEventByCat, createEvent, updateEvent, deleteEvent };
