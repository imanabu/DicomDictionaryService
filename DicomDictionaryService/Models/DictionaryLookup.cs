using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Dicom;
using Microsoft.Ajax.Utilities;

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

            var tagFormatFull= new Regex("^[0-9a-f]{8}$");
            var tagFormatGroup = new Regex("^[0-9a-f]{4}$");

            var mode = Mode.desc;
            if (tagFormatFull.Match(term).Success) mode =Mode.tag;
            else if (tagFormatGroup.Match(term).Success) mode = Mode.group;
            else if (term == "everything") mode = Mode.all;

            while (de.MoveNext())
            {
                DicomDictionaryEntry ent = de.Current;

                string comp = "";

                switch (mode)
                {
                    case Mode.tag:
                        comp = ent.Tag.ToString("J", null);
                        break;

                    case Mode.group:
                        comp = ent.Tag.ToString("J", null).Substring(0,4);
                        break;

                    case Mode.desc:
                        comp = ent.Name.ToLower();
                        comp = comp.Replace("'s", "");
                        comp = comp.Replace("’s", "");
                        comp = comp.Replace(" ", "");
                        break;
                }

                comp = comp.ToLower();

                if (comp.Contains(term) || mode == Mode.all)
                {
                    var vm1 = "1";

                    if (ent.ValueMultiplicity.Maximum == int.MaxValue)
                        vm1 = String.Format("{0} or more", ent.ValueMultiplicity.Minimum);
                    else if (ent.ValueMultiplicity.Maximum == 1)
                    {
                        vm1 = String.Format("{0}", ent.ValueMultiplicity.Maximum);
                    }
                    else if (ent.ValueMultiplicity.Maximum == ent.ValueMultiplicity.Minimum)
                    {
                        vm1 = String.Format("{0} exatly", ent.ValueMultiplicity.Minimum);
                    }
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
            desc,
            group,
            all
        };
    }
}