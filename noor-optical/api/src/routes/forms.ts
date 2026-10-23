import { Router } from 'express';
import { queryOne } from '../db.js';
import {
  asyncRoute,
  optionalEmail,
  optionalString,
  requiredPhone,
  requiredString,
} from '../http.js';

export const formsRouter = Router();

const TIME_SLOTS = ['10-12', '12-14', '14-16', '16-18', '18-20'] as const;

/** Appointment request — stored for staff to confirm. No calendar integration. */
formsRouter.post(
  '/appointments',
  asyncRoute(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const fullName = requiredString(body.fullName, 'fullName', { max: 160 });
    const phone = requiredPhone(body.phone);
    const email = optionalEmail(body.email);
    const serviceSlug = optionalString(body.serviceSlug, 'serviceSlug', 120);
    const preferredDate = optionalString(body.preferredDate, 'preferredDate', 20);
    const requestedTime = optionalString(body.preferredTime, 'preferredTime', 20);
    const notes = optionalString(body.notes, 'notes', 1000);

    const preferredTime =
      requestedTime && (TIME_SLOTS as readonly string[]).includes(requestedTime) ? requestedTime : null;

    let serviceName: string | null = null;
    if (serviceSlug) {
      const service = await queryOne<{ name_fa: string }>(
        'SELECT name_fa FROM services WHERE slug = $1 AND is_active = TRUE',
        [serviceSlug],
      );
      serviceName = service?.name_fa ?? null;
    }

    const row = await queryOne<{ id: number }>(
      `INSERT INTO appointments
         (full_name, phone, email, service_slug, service_name, preferred_date, preferred_time, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id`,
      [fullName, phone, email, serviceSlug, serviceName, preferredDate, preferredTime, notes],
    );

    res.status(201).json({
      reference: `APT-${String(row?.id ?? 0).padStart(5, '0')}`,
      message: 'Appointment request received.',
    });
  }),
);

formsRouter.post(
  '/contact',
  asyncRoute(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const fullName = requiredString(body.fullName, 'fullName', { max: 160 });
    const email = requiredString(body.email, 'email', { max: 320 });
    const phone = optionalString(body.phone, 'phone', 40);
    const subject = optionalString(body.subject, 'subject', 200);
    const message = requiredString(body.message, 'message', { min: 10, max: 4000 });

    const row = await queryOne<{ id: number }>(
      `INSERT INTO contact_messages (full_name, email, phone, subject, message)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [fullName, email, phone, subject, message],
    );

    res.status(201).json({
      reference: `MSG-${String(row?.id ?? 0).padStart(5, '0')}`,
      message: 'Message received.',
    });
  }),
);
