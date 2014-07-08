using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Dicom;

namespace DicomDictionaryService.Models
{
    public class DictionaryLookup : IDcmDictionaryLookup
    {
        private enum Mode
        {
            tag,
            desc
        };

        public List<dictItem> Lookup(String term)
        {

            var results = new List<dictItem>();

            var dd = DicomDictionary.Default;
            var de = dd.GetEnumerator();

            var mode = Mode.tag;

            term = term.ToLower().Replace(",", "").Replace("(", "").Replace(")", "").Replace(" ", "");
            term = term.Replace("'s", "");
            term = term.Replace("’s", "");
            term = term.Replace("patients", "patient");

            var tagFormat1 = new Regex("^[0-9A-Fa-f]{8}$");

            mode = tagFormat1.Match(term).Success ? Mode.tag : Mode.desc;

            while (de.MoveNext())
            {
                var ent = de.Current;

                var comp = "";

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
                    results.Add(new dictItem
                    {
                        tag = ent.Tag.ToString().ToUpper(),
                        description = ent.Name,
                        vr = ent.ValueRepresentations[0].ToString()
                    });
                }
            }

            return results;
        }
    }
}