-- Provisional size groups for common Indian-market cars. Prices remain examples.
-- Only fill unreviewed entries; never overwrite a category already assigned.
with classifications(make, category_id, models) as (
  values
    ('SUZUKI', 'small_hatchback', array['ALTO','ALTO 800','ALTO K10','S-PRESSO','CELERIO','WAGON R','WAGONR','SWIFT']),
    ('MARUTI', 'small_hatchback', array['ALTO','ALTO 800','ALTO K10','S-PRESSO','CELERIO','WAGON R','WAGONR','SWIFT']),
    ('MARUTI SUZUKI', 'small_hatchback', array['ALTO','ALTO 800','ALTO K10','S-PRESSO','CELERIO','WAGON R','WAGONR','SWIFT']),
    ('HYUNDAI', 'small_hatchback', array['SANTRO','GRAND I10','GRAND I10 NIOS','I10']),
    ('TATA', 'small_hatchback', array['TIAGO','TIAGO EV','NANO']),
    ('RENAULT', 'small_hatchback', array['KWID']),
    ('SUZUKI', 'large_hatch_compact_sedan', array['BALENO','IGNIS','DZIRE','SWIFT DZIRE']),
    ('MARUTI', 'large_hatch_compact_sedan', array['BALENO','IGNIS','DZIRE','SWIFT DZIRE']),
    ('MARUTI SUZUKI', 'large_hatch_compact_sedan', array['BALENO','IGNIS','DZIRE','SWIFT DZIRE']),
    ('HYUNDAI', 'large_hatch_compact_sedan', array['I20','AURA','XCENT']),
    ('TATA', 'large_hatch_compact_sedan', array['ALTROZ','TIGOR']),
    ('HONDA', 'large_hatch_compact_sedan', array['AMAZE','JAZZ']),
    ('TOYOTA', 'large_hatch_compact_sedan', array['GLANZA']),
    ('VOLKSWAGEN', 'large_hatch_compact_sedan', array['POLO','AMEO']),
    ('HONDA', 'sedan', array['CITY','CIVIC']),
    ('HYUNDAI', 'sedan', array['VERNA','ELANTRA']),
    ('SKODA', 'sedan', array['SLAVIA','RAPID','OCTAVIA','SUPERB']),
    ('VOLKSWAGEN', 'sedan', array['VIRTUS','VENTO']),
    ('TOYOTA', 'sedan', array['COROLLA','COROLLA ALTIS','CAMRY']),
    ('SUZUKI', 'compact_suv', array['BREZZA','VITARA BREZZA','FRONX','GRAND VITARA']),
    ('MARUTI', 'compact_suv', array['BREZZA','VITARA BREZZA','FRONX','GRAND VITARA']),
    ('MARUTI SUZUKI', 'compact_suv', array['BREZZA','VITARA BREZZA','FRONX','GRAND VITARA']),
    ('TATA', 'compact_suv', array['PUNCH','PUNCH EV','PUNCH.EV','NEXON','NEXON EV','NEXON.EV','CURVV']),
    ('HYUNDAI', 'compact_suv', array['VENUE','CRETA','EXTER']),
    ('KIA', 'compact_suv', array['SONET','SELTOS','SYROS']),
    ('MAHINDRA', 'compact_suv', array['XUV300','XUV 3XO','XUV400']),
    ('RENAULT', 'compact_suv', array['KIGER','DUSTER']),
    ('NISSAN', 'compact_suv', array['MAGNITE','KICKS']),
    ('SKODA', 'compact_suv', array['KUSHAQ','KYLAQ']),
    ('VOLKSWAGEN', 'compact_suv', array['TAIGUN']),
    ('TOYOTA', 'compact_suv', array['URBAN CRUISER','URBAN CRUISER HYRYDER','HYRYDER','TAISOR']),
    ('HONDA', 'compact_suv', array['ELEVATE','WR-V']),
    ('MG', 'compact_suv', array['ASTOR','ZS EV','WINDSOR EV']),
    ('SUZUKI', 'large_suv_mpv', array['ERTIGA','XL6','INVICTO']),
    ('MARUTI', 'large_suv_mpv', array['ERTIGA','XL6','INVICTO']),
    ('MARUTI SUZUKI', 'large_suv_mpv', array['ERTIGA','XL6','INVICTO']),
    ('TOYOTA', 'large_suv_mpv', array['INNOVA','INNOVA CRYSTA','INNOVA HYCROSS','FORTUNER','RUMION','HILUX']),
    ('MAHINDRA', 'large_suv_mpv', array['XUV700','XUV500','SCORPIO','SCORPIO N','SCORPIO-N','THAR','BOLERO','MARAZZO']),
    ('TATA', 'large_suv_mpv', array['HARRIER','SAFARI','HEXA']),
    ('HYUNDAI', 'large_suv_mpv', array['ALCAZAR','TUCSON']),
    ('KIA', 'large_suv_mpv', array['CARENS','CARNIVAL']),
    ('MG', 'large_suv_mpv', array['HECTOR','HECTOR PLUS','GLOSTER']),
    ('RENAULT', 'large_suv_mpv', array['TRIBER'])
)
insert into public.vehicle_models (make, model, category_id)
select c.make, model.name, c.category_id
from classifications c
cross join lateral unnest(c.models) as model(name)
on conflict (make, model) do update
  set category_id = excluded.category_id
  where public.vehicle_models.category_id = 'needs_review';
