-- Add Kütahya Sağlık Bilimleri Üniversitesi (missing from initial seed)
insert into universities (name, country)
values ('Kütahya Sağlık Bilimleri Üniversitesi', 'Türkiye')
on conflict (lower(name), lower(country)) do nothing;
