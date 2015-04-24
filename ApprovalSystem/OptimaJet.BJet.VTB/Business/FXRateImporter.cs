using Admin.DAL;
using OptimaJet.Common;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Exchange;
using OptimaJet.DynamicEntities.ExternalMethods;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.DynamicEntities.Query;
using OptimaJet.DynamicEntities.View;
using OptimaJet.Localization;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OleDb;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;

namespace OptimaJet.BJet.VTB
{
    public class FXRateImporter
    {
        #region properties

        public const string CurrencyCodeColumnName = "Id";

        public const string DateColumnName = "Date";

        #endregion
        #region ctors

        /// <summary>
        /// Initializes a new instance of the FXRateImporter class.
        /// </summary>
        public FXRateImporter(string fXRateImportView, string fXRateImportConnectionString)
            : this()
        {
            
        }

        public FXRateImporter()
        {}

        #endregion

        #region private
        private static EntityContainer GetCurrencies()
        {
            DynamicEntityRepository rep = new DynamicEntityRepository();
            return rep.GetEntitiesByMetadata(rep.GetEntityMetadataByEntityName("Currency"), FilterCriteriaSet.Empty);
        }


        private void SaveFXRates(DataTable dt)
        {
            using (var connection = new SqlConnection(Settings.ConnectionString))
            {
                SqlTransaction transaction = null;
                connection.Open();
                try
                {
                    transaction = connection.BeginTransaction();
                    using (var sqlBulkCopy = new SqlBulkCopy(connection, SqlBulkCopyOptions.TableLock, transaction))
                    {
                        sqlBulkCopy.DestinationTableName = "FXRate";
                        sqlBulkCopy.ColumnMappings.Add("CurrencyId", "CurrencyId");
                        sqlBulkCopy.ColumnMappings.Add("Date", "Date");
                        sqlBulkCopy.ColumnMappings.Add("Id", "Id");
                        sqlBulkCopy.ColumnMappings.Add("Rate", "Rate");

                        sqlBulkCopy.WriteToServer(dt);
                    }
                    transaction.Commit();
                }
                catch (Exception)
                {
                    transaction.Rollback();
                }

            }
        }

        private string ImportFXRates(DataSet ds)
        {
            string res = String.Empty;

            //курсы пишутся через механизм импорта;
            //т.к. максимальное количество параметров в SQL запросе 2100, то пишется кусками по 1000 строк
            const int pageSize = 1000;
            DataSet tempDataSet;
            DataTable tempDataTable;

            FormModel model = FormModelRepository.GetFormModel("FXRate", FormModelType.ImportExport);
            ds.Tables[0].Columns[CurrencyCodeColumnName].ColumnName = "Currency";
            ds.Tables[0].TableName = model.Caption.Replace(" ", "_");
            for (int i = 0; i < ds.Tables[0].Rows.Count; i = i + pageSize)
            {
                tempDataSet = new DataSet();
                tempDataTable = new DataTable();
                tempDataTable = ds.Tables[0].AsEnumerable().Skip(i).Take(pageSize).CopyToDataTable();
                tempDataTable.TableName = ds.Tables[0].TableName;
                tempDataSet.Tables.Add(tempDataTable);

                ImportResult result = ImportExportHelper.Import(model.MainViewName, tempDataSet);
                res += result.GetReport(new ImportResultTextFormatter()) + Environment.NewLine;
            }

            return res;
        }

        private bool SaveFXRates(DataSet ds, ref string report)
        {
            bool res = false;
            try
            {
                if (ds.Tables != null && ds.Tables.Count != 0)
                {
                    report = ImportFXRates(ds);
                    res = true;
                }
            }
            catch (Exception ex)
            {
                report = String.Format("{0}\n(View = {1}; Connection String = {2})",
                    LocalizationProvider.Provider.Get("The exchange rates imported from remote view haven't been saved"), FXRateImportView, FXRateImportConnectionString);
                Logger.Log.Error(report, ex);
            }
            finally
            {
                if (!String.IsNullOrEmpty(report))
                {
                    Logger.Log.Info(report);
                }
            }
            return res;
        }

        #endregion
        #region public
        public DataSet LoadFXRates(DateTime startDate, DateTime endDate, out string report)
        {
            report = String.Empty;
            DataSet resFXRate = new DataSet();
            bool isPeriod = startDate != DateTime.MinValue && endDate != DateTime.MinValue;

            try
            {
                string currencyCodes = String.Join("','", GetCurrencies().Entities.Select(e => e.Code));
                
                if (String.IsNullOrEmpty(currencyCodes))
                {
                    report = LocalizationProvider.Provider.Get("The system doesn't contain currencies. Downloading of exchange rates failed");
                    Logger.Log.Error(report);
                    return resFXRate;
                }

                string commandText = String.Format("select * from [{0}] where [{1}] IN ('{2}')", FXRateImportView, CurrencyCodeColumnName, currencyCodes);

                if (isPeriod)
                {
                    commandText += String.Format(" AND [{0}] >= ? AND [{0}] < ? ", DateColumnName);
                }

                using (OleDbConnection connection = new OleDbConnection(FXRateImportConnectionString))
                {
                    using (OleDbDataAdapter adapter = new OleDbDataAdapter(commandText, connection))
                    {
                        if (isPeriod)
                        {
                            adapter.SelectCommand.Parameters.Add("Date", OleDbType.Date).Value = startDate.Date;
                            adapter.SelectCommand.Parameters.Add("Date", OleDbType.Date).Value = endDate.AddDays(1).Date;
                        }
                        connection.Open();
                        adapter.Fill(resFXRate);
                        connection.Close();
                    }
                }
            }
            catch (Exception ex)
            {
                report = String.Format("{0}\n(View = {1}; Connection String = {2})",
                    LocalizationProvider.Provider.Get("The exchange rates haven't been imported from remote view"), FXRateImportView, FXRateImportConnectionString);

                if (isPeriod)
                    report += String.Format(" {0}: {1} - {1}", LocalizationProvider.Provider.Get("Period"), startDate, endDate);

                Logger.Log.Error(report, ex);
            }

            return resFXRate;
        }

        public bool ImportFXRates(DateTime startDate, DateTime endDate, out string report)
        {
            DataSet ds = LoadFXRates(startDate, endDate, out report);
            return SaveFXRates(ds, ref report);
        }

        public bool ImportFXRates(out string report)
        {
            return ImportFXRates(DateTime.MinValue, DateTime.MinValue, out report);
        }
        #endregion

        public static string FXRateImportConnectionString
        {
            get { return Settings.Current["FXRateImportConnectionString"]; }
        }


        public static string FXRateImportView
        {
            get { return Settings.Current["FXRateImportView"]; }
        }

        public static ExternalMethodCallResult ImportRates()
        {
            return ImportRates(DateTime.MinValue, DateTime.MinValue);
        }

        public static ExternalMethodCallResult ImportRates(DateTime startDate, DateTime endDate)
        {
            string report = String.Empty;
            FXRateImporter importer = new FXRateImporter(FXRateImportView, FXRateImportConnectionString);
            return new ExternalMethodCallResult(importer.ImportFXRates(startDate, endDate, out report));
        }
    }
}
