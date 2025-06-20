import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  // Different queries depending on user role
  let bookings;

  if (req.user.role === 'admin' || req.user.role === 'manager') {
    // Admins and managers can see all bookings
    bookings = await prisma.booking.findMany({
      include: {
        room: {
          select: {
            id: true,
            name: true,
            studio: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  } else if (req.user.role === 'staff') {
    // Staff can see bookings for their assigned studios
    const staffMember = await prisma.staff.findFirst({
      where: {
        userId: req.user.id,
      },
    });

    if (!staffMember) {
      res.status(404);
      throw new Error('Staff record not found');
    }

    bookings = await prisma.booking.findMany({
      where: {
        room: {
          studio: {
            id: staffMember.studioId,
          },
        },
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            studio: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  } else {
    // Regular clients can only see their own bookings
    bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            studio: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  res.status(200).json(bookings);
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  const booking = await prisma.booking.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      room: {
        select: {
          id: true,
          name: true,
          hourlyRate: true,
          studio: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
        },
      },
      equipment: {
        include: {
          equipment: true,
        },
      },
      payments: true,
    },
  });

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check permissions
  if (
    booking.userId !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'manager'
  ) {
    // Check if staff is assigned to this studio
    if (req.user.role === 'staff') {
      const staffMember = await prisma.staff.findFirst({
        where: {
          userId: req.user.id,
          studioId: booking.room.studio.id,
        },
      });

      if (!staffMember) {
        res.status(403);
        throw new Error('Not authorized to access this booking');
      }
    } else {
      res.status(403);
      throw new Error('Not authorized to access this booking');
    }
  }

  res.status(200).json(booking);
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  const { roomId, startTime, endTime, notes, equipmentIds } = req.body;

  // Validate required fields
  if (!roomId || !startTime || !endTime) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Parse dates
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Check if end time is after start time
  if (end <= start) {
    res.status(400);
    throw new Error('End time must be after start time');
  }

  // Check if room exists
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  // Check for booking conflicts
  const existingBooking = await prisma.booking.findFirst({
    where: {
      roomId,
      AND: [
        {
          OR: [
            {
              startTime: {
                lte: end,
              },
              endTime: {
                gte: start,
              },
            },
          ],
        },
        {
          status: {
            in: ['pending', 'confirmed'],
          },
        },
      ],
    },
  });

  if (existingBooking) {
    res.status(400);
    throw new Error('Room is already booked for the selected time');
  }

  // Calculate duration in hours
  const durationHours =
    (end.getTime() - start.getTime()) / (1000 * 60 * 60);

  // Calculate room cost
  let totalPrice = room.hourlyRate * durationHours;

  // Add equipment costs if any
  let equipmentBookings = [];
  if (equipmentIds && equipmentIds.length > 0) {
    const equipment = await prisma.equipment.findMany({
      where: {
        id: {
          in: equipmentIds,
        },
      },
    });

    // Check if all equipment exists
    if (equipment.length !== equipmentIds.length) {
      res.status(404);
      throw new Error('One or more equipment items not found');
    }

    // Calculate equipment costs
    for (const item of equipment) {
      totalPrice += item.dailyRate;
    }

    // Prepare equipment booking data
    equipmentBookings = equipmentIds.map((equipmentId: string) => ({
      equipmentId,
      quantity: 1, // Default quantity
    }));
  }

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      userId: req.user.id,
      roomId,
      startTime: start,
      endTime: end,
      totalPrice,
      notes,
      status: 'pending', // Default status
      paymentStatus: 'pending', // Default payment status
      equipment: {
        create: equipmentBookings,
      },
    },
    include: {
      room: {
        select: {
          id: true,
          name: true,
          studio: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      equipment: {
        include: {
          equipment: true,
        },
      },
    },
  });

  res.status(201).json(booking);
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  const bookingId = req.params.id;
  const { status, startTime, endTime, notes, paymentStatus } = req.body;

  // Check if booking exists
  const existingBooking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      room: {
        select: {
          studio: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!existingBooking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check permissions
  if (
    existingBooking.userId !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'manager'
  ) {
    // Check if staff is assigned to this studio
    if (req.user.role === 'staff') {
      const staffMember = await prisma.staff.findFirst({
        where: {
          userId: req.user.id,
          studioId: existingBooking.room.studio.id,
        },
      });

      if (!staffMember) {
        res.status(403);
        throw new Error('Not authorized to update this booking');
      }
    } else {
      res.status(403);
      throw new Error('Not authorized to update this booking');
    }
  }

  // Prepare update data
  const updateData: any = {};

  // Only update what's provided
  if (status) updateData.status = status;
  if (notes) updateData.notes = notes;
  if (paymentStatus) updateData.paymentStatus = paymentStatus;

  // If time is being updated, check for conflicts
  if (startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check if end time is after start time
    if (end <= start) {
      res.status(400);
      throw new Error('End time must be after start time');
    }

    // Check for booking conflicts (excluding this booking)
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        roomId: existingBooking.roomId,
        id: { not: bookingId },
        AND: [
          {
            OR: [
              {
                startTime: {
                  lte: end,
                },
                endTime: {
                  gte: start,
                },
              },
            ],
          },
          {
            status: {
              in: ['pending', 'confirmed'],
            },
          },
        ],
      },
    });

    if (conflictingBooking) {
      res.status(400);
      throw new Error('Room is already booked for the selected time');
    }

    // Calculate new duration and price
    const room = await prisma.room.findUnique({
      where: { id: existingBooking.roomId },
    });

    if (!room) {
      res.status(404);
      throw new Error('Room not found');
    }

    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    updateData.totalPrice = room.hourlyRate * durationHours;
    updateData.startTime = start;
    updateData.endTime = end;
  }

  // Update booking
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: updateData,
    include: {
      room: {
        select: {
          id: true,
          name: true,
          studio: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      equipment: {
        include: {
          equipment: true,
        },
      },
    },
  });

  res.status(200).json(updatedBooking);
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
export const deleteBooking = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authenticated');
  }

  const bookingId = req.params.id;

  // Check if booking exists
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      room: {
        select: {
          studio: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check permissions
  if (
    booking.userId !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'manager'
  ) {
    // Check if staff is assigned to this studio
    if (req.user.role === 'staff') {
      const staffMember = await prisma.staff.findFirst({
        where: {
          userId: req.user.id,
          studioId: booking.room.studio.id,
        },
      });

      if (!staffMember) {
        res.status(403);
        throw new Error('Not authorized to delete this booking');
      }
    } else {
      res.status(403);
      throw new Error('Not authorized to delete this booking');
    }
  }

  // First delete related equipment bookings
  await prisma.bookingEquipment.deleteMany({
    where: {
      bookingId,
    },
  });

  // Delete booking
  await prisma.booking.delete({
    where: {
      id: bookingId,
    },
  });

  res.status(200).json({ id: bookingId, message: 'Booking deleted successfully' });
};
