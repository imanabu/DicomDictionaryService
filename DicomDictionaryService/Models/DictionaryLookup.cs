using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Dicom;

namespace DicomDictionaryService.Models
{
    public class DictionaryLookup : IDcmDictionaryLookup
    {
        public List<dictItem> Lookup(String term)
        {
            var results = new List<dictItem>();

            DicomDictionary dd = DicomDictionary.Default;
            IEnumerator<DicomDictionaryEntry> de = dd.GetEnumerator();

            term = term.ToLower().Replace(",", "").Replace("(", "").Replace(")", "").Replace(" ", "");
            term = term.Replace("'s", "");
            term = term.Replace("’s", "");
            term = term.Replace("patients", "patient");

            var tagFormat1 = new Regex("^[0-9A-Fa-f]{8}$");

            Mode mode = tagFormat1.Match(term).Success ? Mode.tag : Mode.desc;

            while (de.MoveNext())
            {
                DicomDictionaryEntry ent = de.Current;

                string comp = "";

                switch (mode)
                {
                    case Mode.tag:
                        comp = ent.Tag.ToString("J", null);
                        break;

                    case Mode.desc:
                        comp = ent.Name.ToLower();
                        comp = comp.Replace("'s", "");
                        comp = comp.Replace("’s", "");
                        comp = comp.Replace(" ", "");
                        break;
                }

                if (comp.Contains(term))
                {
                    var vm1 = "1";

                    if (ent.ValueMultiplicity.Maximum == int.MaxValue)
                        vm1 = String.Format("{0} or more", ent.ValueMultiplicity.Minimum);
                    else if (ent.ValueMultiplicity.Maximum > 1)
                        vm1 = String.Format("{0}-{1}", ent.ValueMultiplicity.Minimum, ent.ValueMultiplicity.Maximum);

                    results.Add(new dictItem
                    {
                        tag = ent.Tag.ToString().ToUpper(),
                        description = ent.Name,
                        vm = vm1,
                        vr = ent.ValueRepresentations[0].ToString()
                    });
                }
            }

            return results;
        }

        private enum Mode
        {
            tag,
            desc
        };
    }
}