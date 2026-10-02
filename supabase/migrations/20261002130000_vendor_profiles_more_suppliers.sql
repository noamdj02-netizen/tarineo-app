-- Profils lecture documents : enseignes BTP supplémentaires (Tereva, Descours, etc.)

insert into public.vendor_document_profiles (vendor_key, vendor_display_name, kind, layout_hints, prompt_addon, version, sample_count)
values
  ('tereva', 'Tereva', null, '{"header_markers":["Tereva"],"column_order":["ref","designation","qty","unit","pu_ht"]}'::jsonb,
   'Document Tereva : en-tête Tereva ; lignes avec référence, désignation, quantité, PU HT ; n° devis ou facture en haut.', 1, 0),
  ('descours', 'Descours & Cabaud', null, '{"header_markers":["Descours","Cabaud"],"column_order":["ref","designation","qty","unit","pu_ht"]}'::jsonb,
   'Document Descours & Cabaud : logo Descours ; tableau articles avec code et montants HT.', 1, 0),
  ('bigmat', 'BigMat', null, '{"header_markers":["BigMat"],"column_order":["ref","designation","qty","unit","pu_ht"]}'::jsonb,
   'Document BigMat : en-tête BigMat ; structure classique devis/facture négoce matériaux.', 1, 0),
  ('sfic', 'SFIC', null, '{"header_markers":["SFIC"],"column_order":["ref","designation","qty","unit","pu_ht"]}'::jsonb,
   'Document SFIC : en-tête SFIC ; références et prix unitaires HT.', 1, 0),
  ('prolians', 'Prolians', null, '{"header_markers":["Prolians"],"column_order":["ref","designation","qty","unit","pu_ht"]}'::jsonb,
   'Document Prolians : en-tête Prolians ; lignes produits et totaux en pied de page.', 1, 0)
on conflict (vendor_key, kind) do nothing;
