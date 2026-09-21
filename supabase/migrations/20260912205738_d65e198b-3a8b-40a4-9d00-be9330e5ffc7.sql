ALTER TABLE public.quote_requests
  ADD COLUMN pickup_city text,
  ADD COLUMN hire_hours integer,
  ADD COLUMN luggage integer NOT NULL DEFAULT 0;

ALTER TABLE public.quote_requests
  ADD CONSTRAINT quote_requests_pickup_city_check CHECK (pickup_city IS NULL OR pickup_city IN ('London', 'Paris', 'Bulgaria', 'Dubai')),
  ADD CONSTRAINT quote_requests_hire_hours_check CHECK (hire_hours IS NULL OR hire_hours BETWEEN 2 AND 16),
  ADD CONSTRAINT quote_requests_luggage_check CHECK (luggage BETWEEN 0 AND 8);