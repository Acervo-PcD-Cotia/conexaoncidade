-- Create trigger function for news audit
CREATE OR REPLACE FUNCTION public.audit_news_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, action, new_data, user_id)
    VALUES ('news', NEW.id, 'create', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, action, old_data, new_data, user_id)
    VALUES ('news', NEW.id, 'update', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, action, old_data, user_id)
    VALUES ('news', OLD.id, 'delete', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger on news table
DROP TRIGGER IF EXISTS audit_news_trigger ON public.news;
CREATE TRIGGER audit_news_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.audit_news_changes();