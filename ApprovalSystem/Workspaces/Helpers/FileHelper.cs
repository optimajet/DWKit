using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using Admin.DAL;
using System.Text;

namespace Workspaces.Helpers
{
    public static class FileHelper
    {
        public static byte[] GetFile(string token)
        {
            var data = new byte[0];
            var id = new Guid(token);
            using (var context = new DBEntities(Settings.ConnectionString))
            {
                var file = context.UploadedFiles.FirstOrDefault(f => f.Id == id);
                if (file != null)
                {
                    data = file.Data;
                }

            }

            return data;
        }
    }

    public static class TranslitExtensions
    {
        private static readonly Dictionary<string, string> letters
            = new Dictionary<string, string>
        {
            {"№", "N"},
            {"а", "a"},
            {"б", "b"},
            {"в", "v"},
            {"г", "g"},
            {"д", "d"},
            {"е", "e"},
            {"ё", "yo"},
            {"ж", "zh"},
            {"з", "z"},
            {"и", "i"},
            {"й", "j"},
            {"к", "k"},
            {"л", "l"},
            {"м", "m"},
            {"н", "n"},
            {"о", "o"},
            {"п", "p"},
            {"р", "r"},
            {"с", "s"},
            {"т", "t"},
            {"у", "u"},
            {"ф", "f"},
            {"х", "h"},
            {"ц", "c"},
            {"ч", "ch"},
            {"ш", "sh"},
            {"щ", "sch"},
            {"ъ", "j"},
            {"ы", "i"},
            {"ь", "j"},
            {"э", "e"},
            {"ю", "yu"},
            {"я", "ya"},
            {"А", "A"},
            {"Б", "B"},
            {"В", "V"},
            {"Г", "G"},
            {"Д", "D"},
            {"Е", "E"},
            {"Ё", "Yo"},
            {"Ж", "Zh"},
            {"З", "Z"},
            {"И", "I"},
            {"Й", "J"},
            {"К", "K"},
            {"Л", "L"},
            {"М", "M"},
            {"Н", "N"},
            {"О", "O"},
            {"П", "P"},
            {"Р", "R"},
            {"С", "S"},
            {"Т", "T"},
            {"У", "U"},
            {"Ф", "F"},
            {"Х", "H"},
            {"Ц", "C"},
            {"Ч", "Ch"},
            {"Ш", "Sh"},
            {"Щ", "Sch"},
            {"Ъ", "J"},
            {"Ы", "I"},
            {"Ь", "J"},
            {"Э", "E"},
            {"Ю", "Yu"},
            {"Я", "Ya"}
        };

        /// <summary>
        /// Performs translation from Russian to Translit.
        /// </summary>
        /// <param name="russian">String in Russian to translate.</param>
        /// <returns>String in Translit.</returns>
        public static string ToTranslit(this string russian)
        {
            var builder = new StringBuilder(russian);

            foreach (var letter in letters)
            {
                builder.Replace(letter.Key, letter.Value);
            }

            return builder.ToString();
        }
    }
}