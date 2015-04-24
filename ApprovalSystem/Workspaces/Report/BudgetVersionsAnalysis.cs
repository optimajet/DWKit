//using System;
//using System.Collections.Generic;
//using System.Data;
//using System.Data.SqlClient;
//using System.Linq;
//using System.Text;
//using WebBjet.Reporting.Model;
//using WebBjet.Reporting.Report;

//namespace Workspaces.Report
//{
//    public class BudgetVersionsAnalysis : Analysis
//    {
//        private readonly Guid budgetVersion1;
//        private readonly Guid budgetVersion2;

//        public BudgetVersionsAnalysis(ReportParams reportParams, Guid budgetVersion1, Guid budgetVersion2)
//            : base(reportParams)
//        {
//            this.budgetVersion1 = budgetVersion1;
//            this.budgetVersion2 = budgetVersion2;
//        }

//        protected override Dictionary<string, string> GetColumnExpressions()
//        {
//            var result = base.GetColumnExpressions();

//            result = result
//                .SelectMany((kvp) => new[] { kvp, new KeyValuePair<string, string>(kvp.Key + "_1", kvp.Value) })
//                .ToDictionary(kvp => kvp.Key, kvp => kvp.Value);

//            return result;
//        }

//        protected override IDataParameter[] GetParameters(StringBuilder selectFields, StringBuilder groupByFields, string where)
//        {
//            var result = new List<SqlParameter>
//            {
//                new SqlParameter("@BudgetVersionId", budgetVersion1),
//                new SqlParameter("@BudgetVersionId_1", budgetVersion2),
//                new SqlParameter("@selectFields", selectFields.ToString()),
//                new SqlParameter("@groupByFields", groupByFields.ToString()),
//                new SqlParameter("@where", where),
//            };

//            return result.ToArray();
//        }

//        protected override string GetQuery(StringBuilder selectFields, string querySelect, StringBuilder groupByFields, string where)
//        {
//            return querySelect;
//        }
//    }
//}