-- ============================================================
-- Shop & Shine — optional sample data
-- Run AFTER schema.sql. Safe to re-run (uses ON CONFLICT).
-- Image paths here are full URLs (placeholder photos) so the store looks
-- populated immediately. Replace them by uploading real photos in the admin.
-- ============================================================

insert into public.categories (name, slug, sort_order) values
  ('Rings',     'rings',     1),
  ('Necklaces', 'necklaces', 2),
  ('Earrings',  'earrings',  3),
  ('Bracelets', 'bracelets', 4),
  ('Pendants',  'pendants',  5)
on conflict (slug) do nothing;

insert into public.products
  (name, slug, description, price, category_id, stock, is_featured, is_new, tags)
values
  ('Rose Petal Diamond Ring', 'rose-petal-diamond-ring',
   'A delicate 18k rose gold ring with a brilliant-cut diamond.', 45000,
   (select id from public.categories where slug = 'rings'), 8, true, true, '{Bridal,Minimalist}'),
  ('Blush Pearl Necklace', 'blush-pearl-necklace',
   'Elegant freshwater pearls on a fine rose-gold chain.', 28000,
   (select id from public.categories where slug = 'necklaces'), 12, true, false, '{Heritage}'),
  ('Petite Pearl Drop Earrings', 'petite-pearl-drop-earrings',
   'Classic freshwater pearls with rose-gold hooks.', 15000,
   (select id from public.categories where slug = 'earrings'), 20, true, false, '{Minimalist}'),
  ('Rosé Tennis Bracelet', 'rose-tennis-bracelet',
   'Pink sapphires set in a flexible rose-gold band.', 62000,
   (select id from public.categories where slug = 'bracelets'), 4, true, false, '{Bridal,Heritage}'),
  ('Everyday Rose Band', 'everyday-rose-band',
   'A simple, modern rose-gold band for daily wear.', 12000,
   (select id from public.categories where slug = 'rings'), 25, false, true, '{Minimalist}'),
  ('Pink Sapphire Pendant', 'pink-sapphire-pendant',
   'A pink sapphire encased in a diamond halo.', 35000,
   (select id from public.categories where slug = 'pendants'), 10, false, true, '{Heritage}')
on conflict (slug) do nothing;

insert into public.product_images (product_id, storage_path, is_primary, position)
select p.id, v.url, true, 0
from (values
  ('rose-petal-diamond-ring',     'https://picsum.photos/seed/ss-ring1/800/1000'),
  ('blush-pearl-necklace',        'https://picsum.photos/seed/ss-neck1/800/1000'),
  ('petite-pearl-drop-earrings',  'https://picsum.photos/seed/ss-ear1/800/1000'),
  ('rose-tennis-bracelet',        'https://picsum.photos/seed/ss-brac1/800/1000'),
  ('everyday-rose-band',          'https://picsum.photos/seed/ss-ring2/800/1000'),
  ('pink-sapphire-pendant',       'https://picsum.photos/seed/ss-pend1/800/1000')
) as v(slug, url)
join public.products p on p.slug = v.slug
on conflict do nothing;
