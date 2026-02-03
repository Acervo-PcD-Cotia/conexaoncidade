-- Fix search_path warnings for critical functions

-- 1. Fix update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. Fix update_publidoor_updated_at
CREATE OR REPLACE FUNCTION public.update_publidoor_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 3. Fix update_academy_updated_at
CREATE OR REPLACE FUNCTION public.update_academy_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 4. Fix illumina_update_timestamp
CREATE OR REPLACE FUNCTION public.illumina_update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 5. Fix autopost_update_timestamp
CREATE OR REPLACE FUNCTION public.autopost_update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

-- 6. Fix calculate_community_level
CREATE OR REPLACE FUNCTION public.calculate_community_level(_points integer)
 RETURNS community_level
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path = public
AS $function$
BEGIN
  IF _points >= 5000 THEN RETURN 'leader';
  ELSIF _points >= 2000 THEN RETURN 'ambassador';
  ELSIF _points >= 500 THEN RETURN 'collaborator';
  ELSE RETURN 'supporter';
  END IF;
END;
$function$;

-- 7. Fix update_community_level
CREATE OR REPLACE FUNCTION public.update_community_level()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.level := public.calculate_community_level(NEW.points);
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

-- 8. Fix normalize_title_fingerprint
CREATE OR REPLACE FUNCTION public.normalize_title_fingerprint(title text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path = public
AS $function$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        unaccent(coalesce(title, '')),
        '[^a-z0-9]', '', 'g'
      ),
      '\s+', '', 'g'
    )
  );
END;
$function$;

-- 9. Fix generate_content_hash
CREATE OR REPLACE FUNCTION public.generate_content_hash(content text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path = public
AS $function$
BEGIN
  RETURN encode(sha256(convert_to(coalesce(content, ''), 'UTF8')), 'hex');
END;
$function$;