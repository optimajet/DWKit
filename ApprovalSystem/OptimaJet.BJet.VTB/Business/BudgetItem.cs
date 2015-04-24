using OptimaJet.BJet.VTB.Calculation;
using OptimaJet.Common;
using OptimaJet.DynamicEntities;
using OptimaJet.DynamicEntities.DataProvider;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Exchange;
using OptimaJet.DynamicEntities.ExternalMethods;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.DynamicEntities.Query;
using OptimaJet.DynamicEntities.View;
using OptimaJet.Localization;
using OptimaJet.Security.Providers;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;
using Platform.ExternalMethods;
using OptimaJet.Workflow.Core.Runtime;
using System.Web;

namespace OptimaJet.BJet.VTB
{
    public class BudgetItem
    {
        public static bool Import(DataSet ds, out string result, bool ignoreerror, bool impimport, Func<dynamic, bool> progress = null)
        {
            if(impimport)
            {
                if (!SecurityCache.FormCan("BudgetItem", "ImpersonateImport"))
                {
                    throw new Exception(LocalizationProvider.Provider.Get("You don't have permission: Impersonate Import"));
                }
            }

            StringBuilder msg = new StringBuilder();
            
            var budgetItems = new List<dynamic>();
            var budgetItemAllocations = new List<dynamic>();

            var accounts = DynamicRepository.GetByEntity("AccountCode");
            var projects = DynamicRepository.GetByEntity("Project");
            var legalentities = DynamicRepository.GetByEntity("LegalEntity");
            var employees = DynamicRepository.GetByView("Employee");
            var currencies = DynamicRepository.GetByEntity("Currency");
            var costcenters = DynamicRepository.GetByEntity("CostCenter");

            int count = 0;
            int index = 0;
            foreach(DataTable table in ds.Tables)
            {
                if(table.Rows.Count > 3)
                {
                    count += table.Rows.Count - 3;
                }
            }

            var metadataBudgetItem = MetadataRepositoty.GetEntityMetadata("BudgetItem_Edit");

            foreach(DataTable table in ds.Tables)
            {
                for(int i = 3; i < table.Rows.Count; i++)
                {
                    StringBuilder sb = new StringBuilder();
                    var tmpAllocations = new List<dynamic>();

                    var budgetItem = DynamicRepository.NewByView("BudgetItem_Edit");
                    var emCallResult = DynamicRepository.CallExternalMethods(budgetItem, "BudgetItem_Edit", metadataBudgetItem, ExternalMethodCallType.PrepareCreatedData);
                    if(!emCallResult.Sucess)
                        throw new Exception(emCallResult.GetGlobalMessage());

                    budgetItem.Id = Guid.NewGuid();                    
                    Guid? letoallocateId = null;
                    DataRow row = table.Rows[i];

                    if(row[0] == null)
                    {
                        count--;
                        continue;
                    }

                    decimal capexSum = 0;
                    decimal opexSum = 0;

                    #region fill columns
                    for (int j = 0; j < row.Table.Columns.Count; j++)
                    {
                        if(j < 31) //Основные поля
                        {
                            switch (j)
                            {
                                case (int)BudgetItemImportColumn.Account:
                                    var a = accounts.FirstOrDefault(c => c.Name.ToLower().Trim() == row[j].ToString().ToLower().Trim());
                                    if (a != null) budgetItem.AccountCodeId = a.Id;
                                    else sb.AppendLine(string.Format("{0}:#{1}:{2}: AccountCode '{3}' {4}", table.TableName, row[0], j, row[j], Localization.LocalizationProvider.Provider.Get("not found")));
                                    break;
                                case (int)BudgetItemImportColumn.Project:
                                    var p = projects.FirstOrDefault(c => c.Code.ToLower().Trim() == row[j].ToString().ToLower().Trim());
                                    if (p != null) budgetItem.ProjectId = p.Id;
                                    else sb.AppendLine(string.Format("{0}:#{1}:{2}: Project '{3}' {4}", table.TableName, row[0], j, row[j], Localization.LocalizationProvider.Provider.Get("not found")));
                                    break;
                                case (int)BudgetItemImportColumn.DetailProjectCode:
                                    budgetItem.DetailedProjectCode = row[j].ToString();
                                    break;
                                case (int)BudgetItemImportColumn.Description:
                                    budgetItem.Description = row[j].ToString();
                                    break;
                                case (int)BudgetItemImportColumn.LegalEntityToPay:
                                    var le = legalentities.FirstOrDefault(c => c.Name.ToLower().Trim() == row[j].ToString().ToLower().Trim());
                                    if (le != null) budgetItem.LegalEntityToPayId = le.Id;
                                    else sb.AppendLine(string.Format("{0}:#{1}:{2}: Legal Entity '{3}' {4}", table.TableName, row[0], j, row[j], Localization.LocalizationProvider.Provider.Get("not found")));
                                    break;
                                case (int)BudgetItemImportColumn.LegalEntityToAllocateExpense:
                                    var letoallocate = legalentities.FirstOrDefault(c => c.Name.ToLower().Trim() == row[j].ToString().ToLower().Trim());
                                    if (letoallocate != null) letoallocateId = letoallocate.Id;
                                    else sb.AppendLine(string.Format("{0}:#{1}:{2}: Legal Entity '{3}' {4}", table.TableName, row[0], j, row[j], Localization.LocalizationProvider.Provider.Get("not found")));
                                    break;
                                case (int)BudgetItemImportColumn.Manager:
                                    var empl = employees.FirstOrDefault(c => c.SecurityUserId_Name.ToLower().Trim() == row[j].ToString().ToLower().Trim());
                                    if (empl != null) budgetItem.ManagerEmployeeId = empl.Id;
                                    else sb.AppendLine(string.Format("{0}:#{1}:{2}: Employee '{3}' {4}", table.TableName, row[0], j, row[j], Localization.LocalizationProvider.Provider.Get("not found")));
                                    break;
                                case (int)BudgetItemImportColumn.ApproxDatesForDelivery:
                                    byte approxDatesForDelivery = 0;
                                    switch (row[j].ToString().ToLower().Trim())
                                    {
                                        case "q1": approxDatesForDelivery = 1; break;
                                        case "q2": approxDatesForDelivery = 2; break;
                                        case "q3": approxDatesForDelivery = 3; break;
                                        case "q4": approxDatesForDelivery = 4; break;
                                    }
                                    budgetItem.ApproxDatesForDelivery = approxDatesForDelivery;
                                    break;
                                case (int)BudgetItemImportColumn.Currency:
                                    var currency = currencies.FirstOrDefault(c => c.Code.ToLower().Trim() == row[j].ToString().ToLower().Trim());
                                    if (currency != null) budgetItem.CurrencyId = currency.Id;
                                    else sb.AppendLine(string.Format("{0}:#{1}:{2}: Currency '{3}' {4}", table.TableName, row[0], j, row[j], Localization.LocalizationProvider.Provider.Get("not found")));
                                    break;
                                case (int)BudgetItemImportColumn.ContractStarts:
                                    if (!string.IsNullOrWhiteSpace(row[j].ToString()))
                                    {
                                        int contractStarts = 0;
                                        if (int.TryParse(row[j].ToString().Replace(",", "."), NumberStyles.Any, CultureInfo.InvariantCulture, out contractStarts))
                                        {
                                            budgetItem.ContractStarts = contractStarts;
                                        }
                                        else
                                        {
                                            sb.AppendLine(string.Format("{0}:#{1}:{2}: {3} '{4}' {5}", table.TableName, row[0], j, row[j], table.Columns[j], Localization.LocalizationProvider.Provider.Get("error value")));
                                        }
                                    }

                                    break;
                                case (int)BudgetItemImportColumn.ContractEnds:
                                    if (!string.IsNullOrWhiteSpace(row[j].ToString()))
                                    {
                                        int contractEnds = 0;
                                        if (int.TryParse(row[j].ToString().Replace(",", "."), NumberStyles.Any, CultureInfo.InvariantCulture, out contractEnds))
                                        {
                                            budgetItem.ContractEnds = contractEnds;
                                        }
                                        else
                                        {
                                            sb.AppendLine(string.Format("{0}:#{1}:{2}: {3} '{4}' {5}", table.TableName, row[0], j, row[j], table.Columns[j], Localization.LocalizationProvider.Provider.Get("error value")));
                                        }
                                    }
                                    break;
                                case (int)BudgetItemImportColumn.VATApplicable:
                                    budgetItem.VATApplicable = row[j].ToString().ToLower().Trim() == "yes";
                                    break;
                                case (int)BudgetItemImportColumn.CAPEX:
                                    if (!string.IsNullOrWhiteSpace(row[j].ToString()))
                                    {
                                        if (decimal.TryParse(row[j].ToString().Replace(",", "."), NumberStyles.Any, CultureInfo.InvariantCulture, out capexSum))
                                        {
                                            capexSum = Math.Round(capexSum, 2);
                                        }
                                        else
                                        {
                                            sb.AppendLine(string.Format("{0}:#{1}:{2}: {3} '{4}' {5}", table.TableName, row[0], j, row[j], table.Columns[j], Localization.LocalizationProvider.Provider.Get("error value")));
                                        }
                                    }
                                    break;
                                case (int)BudgetItemImportColumn.OPEX:
                                    if (!string.IsNullOrWhiteSpace(row[j].ToString()))
                                    {
                                        if (decimal.TryParse(row[j].ToString().Replace(",", "."), NumberStyles.Any, CultureInfo.InvariantCulture, out opexSum))
                                        {
                                            opexSum = Math.Round(opexSum, 2);
                                        }
                                        else
                                        {
                                            sb.AppendLine(string.Format("{0}:#{1}:{2}: {3} '{4}' {5}", table.TableName, row[0], j, row[j], table.Columns[j], Localization.LocalizationProvider.Provider.Get("error value")));
                                        }
                                    }
                                    break;
                                case (int)BudgetItemImportColumn.UsefulLife:
                                    if (!string.IsNullOrWhiteSpace(row[j].ToString()))
                                    {
                                        int usefulLife = 0;
                                        if (int.TryParse(row[j].ToString().Replace(",", "."), NumberStyles.Any, CultureInfo.InvariantCulture, out usefulLife))
                                        {
                                            budgetItem.UsefulLife = usefulLife;
                                        }
                                        else
                                        {
                                            sb.AppendLine(string.Format("{0}:#{1}:{2}: {3} '{4}' {5}", table.TableName, row[0], j, row[j], table.Columns[j], Localization.LocalizationProvider.Provider.Get("error value")));
                                        }
                                    }
                                    break;
                            }
                        }
                        else //Аллокация
                        {
                            if (!string.IsNullOrWhiteSpace(row[j].ToString()))
                            {
                                decimal weight = 0;
                                int k = 1;
                                string value = row[j].ToString();
                                if (!value.Contains('%'))
                                    k = 100;

                                if (decimal.TryParse(row[j].ToString().Replace("%", "").Replace(",", "."), NumberStyles.Any, CultureInfo.InvariantCulture, out weight))
                                {
                                    var allocation = DynamicRepository.NewByView("BudgetItemAllocation");                                    
                                    allocation.Id = Guid.NewGuid();
                                    allocation.BudgetItemId = budgetItem.Id;
                                    allocation.LegalEntityId = letoallocateId;
                                    allocation.Weight = Math.Round(weight * k, 2);

                                    var ccCode = row.Table.Rows[2][j].ToString();
                                    var costcenter = costcenters.FirstOrDefault(c => c.Code.ToLower().Trim() == ccCode.ToLower().Trim());
                                    if (costcenter != null) allocation.CostCenterId = costcenter.Id;
                                    else sb.AppendLine(string.Format("{0}:#{1}:{2}: Cost center '{3}' {4}", table.TableName, row[0], j, ccCode, Localization.LocalizationProvider.Provider.Get("not found")));

                                    tmpAllocations.Add(allocation);
                                }
                                else
                                {
                                    sb.AppendLine(string.Format("{0}:#{1}:{2}: {3} '{4}' {5}", table.TableName, row[0], j, row[j], table.Columns[j], Localization.LocalizationProvider.Provider.Get("error value")));
                                }
                            }
                        }
                    }
                    #endregion

                    if(budgetItem.VATApplicable)
                    {
                        var le = legalentities.Where(c => c.Id == budgetItem.LegalEntityToPayId).FirstOrDefault();
                        if (le != null)
                        {
                            budgetItem.VAT = le.VAT;
                        }
                    }

                    #region Validation

                    decimal allocationWeight = 0;
                    foreach (var a in tmpAllocations)
                        allocationWeight += a.Weight;

                    if (allocationWeight != 100)
                    {
                        sb.AppendLine(string.Format("{0}:#{1} ({2}): {3}!", table.TableName, row[0], allocationWeight,
                                Localization.LocalizationProvider.Provider.Get("Cumulative percentage in allocative model must be equal to 100%")));
                    }

                    #endregion

                    if (sb.Length > 0)
                    {
                        msg.Append(sb.ToString());                        
                    }
                    else
                    {
                        budgetItems.Add(budgetItem);
                        budgetItemAllocations.AddRange(tmpAllocations);

                        #region CAPEX/OPEX
                        if (capexSum == 0 || opexSum == 0)
                        {
                            if (capexSum != 0)
                            {
                                budgetItem.CAPEXOPEX = 0;
                                budgetItem.AmountWithoutVAT = capexSum;
                            }
                            else
                            {
                                budgetItem.CAPEXOPEX = 1;
                                budgetItem.AmountWithoutVAT = opexSum;
                                budgetItem.UsefulLife = null;
                            }
                        }
                        else
                        {
                            var budgetItemOpex = DynamicRepository.NewByView("BudgetItem_Edit");
                            (budgetItemOpex as DynamicEntity).MergeProperties(budgetItem as DynamicEntity, false);
                            budgetItemOpex.Id = Guid.NewGuid();
                            budgetItems.Add(budgetItemOpex);

                            budgetItem.CAPEXOPEX = 0;
                            budgetItem.AmountWithoutVAT = capexSum;

                            budgetItemOpex.CAPEXOPEX = 1;
                            budgetItemOpex.AmountWithoutVAT = opexSum;

                            foreach (var budgetItemAllocation in budgetItemAllocations.Where(c => c.BudgetItemId == budgetItem.Id).ToArray())
                            {
                                var budgetItemAllocationOpex = DynamicRepository.NewByView("BudgetItemAllocation");
                                (budgetItemAllocationOpex as DynamicEntity).MergeProperties(budgetItemAllocation as DynamicEntity, false);
                                budgetItemAllocationOpex.Id = Guid.NewGuid();
                                budgetItemAllocationOpex.BudgetItemId = budgetItemOpex.Id;
                                budgetItemAllocations.Add(budgetItemAllocationOpex);
                            }

                            index++;
                            count++;
                        }
                        #endregion
                    }
                    index++;

                    if(progress != null)
                    {
                        progress(new {
                            Message = string.Format(Localization.LocalizationProvider.Provider.Get("Processed record {0} of {1}..."), index, count),
                            Index = index,
                            Count = count
                        });
                     }
                }
            }

            if (msg.Length == 0 || ignoreerror)            
            {
                using (var connection = DatabaseCommunicationFactory.GetDataConnection())
                {
                    connection.Open();
                    var options = new ExecutorTransactionOption(TransactionType.None);
                    var transaction = options.BeginTransaction(connection);
                    
                    SharedCommunicationObjects.SharedConnection = connection;
                    SharedCommunicationObjects.SharedTransaction = transaction;

                    try
                    {

                        var emCallResult =
                            DynamicRepository.CallExternalMethods(
                                budgetItems.Select(c => c as DynamicEntity).ToArray(), "BudgetItem_Edit",
                                metadataBudgetItem, ExternalMethodCallType.BeforeInsert);
                        if (!emCallResult.Sucess)
                            throw new Exception(emCallResult.GetGlobalMessage());

                        if (impimport)
                        {
                            foreach (var e in budgetItems)
                            {
                                e.CreatorEmployeeId = e.ManagerEmployeeId;
                            }
                        }

                        DynamicRepository.InsertByView("BudgetItem_Edit", budgetItems, ExternalMethodsCallMode.AfterOnly);
                        DynamicRepository.InsertByView("BudgetItemAllocation", budgetItemAllocations);

                        var verisons =
                            VersionHelper.CloseVersions(
                                budgetItems.Select(c => new VersionInfo() { Id = c.Id }).ToList(),
                                metadataBudgetItem.TableName);
                        VersionHelper.CreateNewVersions(verisons, metadataBudgetItem.TableName);

                        SharedCommunicationObjects.CommitSharedTransaction();
                        connection.Close();
                    }
                    finally
                    {
                        SharedCommunicationObjects.SharedConnection = null;
                        SharedCommunicationObjects.SharedTransaction = null;
                    }
                }

                result = string.Format(LocalizationProvider.Provider.Get("Load {0} records."), budgetItems.Count);
                if(msg.Length > 0)
                {
                    result += string.Format("\r\n{0}:\r\n{1}", LocalizationProvider.Provider.Get("Errors"), msg);
                }
                return true;
            }
            else
            {
                result = string.Format("{0}:\r\n{1}", LocalizationProvider.Provider.Get("Errors"), msg);
                return false;
            }
        }

        protected static Dictionary<Guid, dynamic> CopyEntityAccessChilds(string entityName, Dictionary<object, object> replaceIds, Guid oldParentId, Guid newParentId)
        {
            var entityAccessChilds = DynamicRepository.GetByEntity(entityName, FilterCriteriaSet.And.Equal(oldParentId, "EntityAccessId"));
            var res = new Dictionary<Guid, dynamic>();
            if (entityAccessChilds != null && entityAccessChilds.Count > 0)
            {
                foreach (dynamic entityAccessChild in entityAccessChilds)
                {
                    var oldId = entityAccessChild.Id;
                    entityAccessChild.Id = Guid.NewGuid();
                    entityAccessChild.EntityAccessId = newParentId;
                    replaceIds.Add(oldId, entityAccessChild.Id);
                    res.Add(oldId, entityAccessChild);
                }
                DynamicRepository.InsertByEntity(entityName, entityAccessChilds);
            }
            return res;
        }

        public static void CopyToNewBudgetVersion(object newBudgetId, object oldBudgetId, Dictionary<string, Dictionary<object, object>> replacesByTable)
        {
            var replaceIds = new Dictionary<object, object>();
            var changedDate = DateTime.Now;
            var repository = new DynamicEntityRepository();

            var newVersion = DynamicRepository.GetByEntity("BudgetVersion",
                FilterCriteriaSet.And.Equal(newBudgetId, "BudgetId")
                    .Merge(FilterCriteriaSet.And.Equal(true, "IsCurrent"))).FirstOrDefault();

            var oldVersion = DynamicRepository.GetByEntity("BudgetVersion",
                FilterCriteriaSet.And.Equal(oldBudgetId, "BudgetId")
                    .Merge(FilterCriteriaSet.And.Equal(true, "IsCurrent"))).FirstOrDefault();

            var newBudget = DynamicRepository.GetByEntity("Budget",
                FilterCriteriaSet.And.Equal(newBudgetId, "Id")).FirstOrDefault();

            bool internalTransaction = false;

            if (SharedCommunicationObjects.SharedTransaction == null)
            {
                SharedCommunicationObjects.CreateSharedTransaction();
                internalTransaction = true;
            }

            try
            {
                #region BudgetItems

                var biMetadata = repository.GetEntityMetadataByEntityName("BudgetItem");

                List<dynamic> records =
                    biMetadata.Get(
                        FilterCriteriaSet.And.Equal((Guid) oldVersion.Id, "BudgetVersionId")
                            .NotEqual(true, "IsDeleted")
                            .NotEqual("Deleted", "State")
                            .NotEqual(true, "IsPrevPeriod"));

                foreach (dynamic r in records)
                {
                    var oldId = r.Id;
                    r.Id = Guid.NewGuid();
                    r.BudgetVersionId = newVersion.Id;
                    r.WasBack = false;
                    r.State = "Draft";
                    r.StateName = "Draft";
                    r.EntityRouteId = null;
                    r.ChangedDate = changedDate;

                    //Заменяем ссылки на скопированные в новый бюджет справочники

                    ReplaceToNewIds(replacesByTable, biMetadata, r);

                    replaceIds.Add(oldId, r.Id);
                }

                var dynamicEntities = records.ConvertAll(d=> d as DynamicEntity);

                PrimaryKeyGenerator.SPGenerateKey(biMetadata, dynamicEntities,
                    new Dictionary<string, string>
                    {
                        {"StoredProcedure", "data_get_sequence"},
                        {"ColumnName", "NumberId"},
                        {"Value", "Value"},
                        {"Code", "BudgetItem"}
                    });

                //Перерасчет остатков
                //BudgetItemMethods.InitResidual(biMetadata, null, dynamicEntities);
                DWKitHelper.EMExecute("BudgetItem.InitResidual", biMetadata, null, dynamicEntities);

                DynamicRepository.InsertByEntity("BudgetItem", records);

                #endregion

                //Словарь со всеми заменами Id-ов
                var allReplaces = replacesByTable.Select(replaces => replaces.Value).ToList();
                allReplaces.Add(replaceIds);

                #region Depends
                var tableList = new Dictionary<string, string>
                {
                    {"BudgetItemAllocation", "BudgetItemId"}
                };

                var b = new Budget();
                foreach (var t in tableList)
                {
                    var replaceByPropertyName = new Dictionary<string, Dictionary<object, object>> { { t.Value, replaceIds } };

                    var tMetadata = repository.GetEntityMetadataByEntityName(t.Key);

                    foreach (var att in tMetadata.PlainAttributes.Where(a=>a.IsReference))
                    {
                        if (!replacesByTable.ContainsKey(att.ReferencedTableName))
                            continue;

                        var replace = replacesByTable[att.ReferencedTableName];

                        replaceByPropertyName.Add(att.PropertyName, replace);
                    }

                  
                    var tmpFilter = FilterCriteriaSet.And.Custom(string.Format("{0} in (select Id from BudgetItem WHERE BudgetVersionId = '{1}')", t.Value, (Guid)oldVersion.Id));
                    var replaces = b.CopyDependsEntity(t.Key, (t.Value == "Id" ? null : "Id"), tmpFilter,
                        replaceByPropertyName, true);

                    allReplaces.Add(replaces);

                }
                #endregion

                #region UploadedFiles
                CopyUploadedFiles(replaceIds);
                #endregion

                #region EntityAccess

                //Все замены в один словарь
                var allReplacesDictionary = allReplaces.SelectMany(dict => dict)
                         .ToDictionary(pair => pair.Key, pair => pair.Value);

                CopyEntityAccess(oldVersion, newVersion, allReplacesDictionary);
                #endregion

                #region Created PrevPeriod BudgetItems

                var biIdsForReclc = BudgetItem.SyncFutureBudgetItem((int)newBudget.Name, replaceIds);
                VtbRestCalculator.Calc.RecalculateAccount(biIdsForReclc, newBudget.Id);

                #endregion

                if (internalTransaction)
                    SharedCommunicationObjects.CommitSharedTransaction();
            }
            catch (Exception ex)
            {
                if (internalTransaction)
                    SharedCommunicationObjects.RollbackSharedTransaction();
                throw ex;
            }
            finally
            {
                if (internalTransaction)
                    SharedCommunicationObjects.DestroySharedTransaction();
            }
        }

        private static void ReplaceToNewIds(Dictionary<string, Dictionary<object, object>> replaces, EntityMetadata biMetadata, dynamic r)
        {
            foreach (var att in biMetadata.PlainAttributes.Where(a => a.IsReference))
            {
                if (!replaces.ContainsKey(att.ReferencedTableName))
                    continue;

                var replace = replaces[att.ReferencedTableName];

                var oldValue = (r as DynamicEntity).GetProperty(att.PropertyName);

                if (!replace.ContainsKey(oldValue))
                    throw new Exception(string.Format("Can not find replace for attribute = {0}", att.PropertyName));

                var newValue = replace[oldValue];

                (r as DynamicEntity).TrySetMember(att.PropertyName, newValue);
            }
        }

        public static void StartNewPlanCycle(Guid budgetId)
        {
            var replaceIds = new Dictionary<object, object>();
            bool internalTransaction = false;
            
            if(SharedCommunicationObjects.SharedTransaction == null)
            {
                SharedCommunicationObjects.CreateSharedTransaction();
                internalTransaction = true;
            }

            try
            {  
                var currentBV = DynamicRepository.GetByEntity("BudgetVersion",
                    FilterCriteriaSet.And.Equal(budgetId, "BudgetId").Merge(FilterCriteriaSet.And.Equal(true, "IsCurrent"))).FirstOrDefault();

                if (currentBV == null)
                {
                    throw new Exception(LocalizationProvider.Provider.Get("Current version not found! Please, create an current version of budget."));
                }

                var newBV = DynamicRepository.NewByEntity("BudgetVersion");
                newBV.Id = Guid.NewGuid();
                newBV.IsCurrent = false;
                newBV.BudgetId = budgetId;
                newBV.PrevVersionId = currentBV.PrevVersionId;
                newBV.Name = DateTime.Now.ToShortDateString();

                currentBV.PrevVersionId = newBV.Id;

                DynamicRepository.InsertByEntity("BudgetVersion", new List<dynamic>() { newBV });
                DynamicRepository.UpdateByEntity("BudgetVersion", new List<dynamic>() { currentBV });

                #region BudgetItems

                List<dynamic> records = DynamicRepository.GetByEntity("BudgetItem",
                    FilterCriteriaSet.And.Equal((Guid)currentBV.Id, "BudgetVersionId"));

                CopyBudgetItems(records, newBV, replaceIds);

                #endregion

                #region Depends

                Dictionary<object, object> budgetAllocationReplaceIds;
                CopyBudgetItemDepends(replaceIds, currentBV, out budgetAllocationReplaceIds);

                #endregion

                #region History

                CopyHistory(currentBV, replaceIds, newBV, budgetAllocationReplaceIds);

                #endregion

                #region UploadedFiles
                CopyUploadedFiles(replaceIds);
                #endregion

                #region EntityAccess
                CopyEntityAccess(currentBV, newBV, replaceIds);
                #endregion

                if (internalTransaction)
                    SharedCommunicationObjects.CommitSharedTransaction();
            }
            catch(Exception ex)
            {
                if(internalTransaction)
                    SharedCommunicationObjects.RollbackSharedTransaction();
                throw ex;
            }
            finally
            {
                if (internalTransaction)
                    SharedCommunicationObjects.DestroySharedTransaction();
            }

            #region to Draft state
            var wfParam = new Dictionary<string, object>
                {
                    {"Comment", string.Format("Starting a new planning cycle.")}
                };

            var ignoredStates = new string[] { "deleted", "on hold", "draft" };

            foreach (var processId in replaceIds.Select(c => (Guid)c.Key))
            {
                if (Workflow.Runtime.IsProcessExists(processId))
                {
                    var state = Workflow.Runtime.GetCurrentStateName(processId);
                    if (ignoredStates.Contains(state.ToLower()))
                        continue;

                    try
                    {
                        Workflow.Runtime.GetAvailableCommands(processId, string.Empty);

                        Workflow.Runtime.SetState(processId,
                            SecurityCache.CurrentUser.Id.ToString("N"),
                            SecurityCache.CurrentUser.Id.ToString("N"),
                            "Draft", wfParam);
                    }
                    catch (Exception ex)
                    {
                        Logger.Log.Error(ex);
                    }
                }
            }
            #endregion
        }

        private static void CopyHistory(dynamic currentBV, Dictionary<object, object> replaceIds, dynamic newBV,
            Dictionary<object, object> budgetAllocationReplaceIds)
        {
            List<dynamic> h_records = DynamicRepository.GetByEntity("H_BudgetItem",
                FilterCriteriaSet.And.Equal((Guid) currentBV.Id, "BudgetVersionId"));
            var h_replaceIds = new Dictionary<object, object>();

            for (int i = h_records.Count - 1; i >= 0; i--)
            {
                if (!replaceIds.ContainsKey(h_records[i].VersioningEntityId))
                    h_records.Remove(h_records[i]);
            }

            foreach (dynamic r in h_records)
            {
                var oldId = r.Id;
                r.Id = Guid.NewGuid();
                r.BudgetVersionId = newBV.Id;
                r.VersioningEntityId = replaceIds[r.VersioningEntityId];
                h_replaceIds.Add(oldId, r.Id);
            }
            DynamicRepository.InsertByEntity("H_BudgetItem", h_records);

            Dictionary<string, Dictionary<object, object>> h_param = new Dictionary<string, Dictionary<object, object>>();
            h_param.Add("VersioningBaseEntityId", h_replaceIds);
            if (budgetAllocationReplaceIds != null)
                h_param.Add("VersioningEntityId", budgetAllocationReplaceIds);

            var h_tmpFilter =
                FilterCriteriaSet.And.Custom(string.Format(
                    "{0} in (select Id from H_BudgetItem WHERE BudgetVersionId = '{1}')", "VersioningBaseEntityId",
                    (Guid) currentBV.Id));
            var b = new Budget();
            b.CopyDependsEntity("H_BudgetItemAllocation", "Id", h_tmpFilter, h_param);
        }

        private static void CopyBudgetItems(List<dynamic> records , dynamic newBV, Dictionary<object, object> replaceIds)
        {
            foreach (dynamic r in records)
            {
                var oldId = r.Id;
                r.Id = Guid.NewGuid();
                r.BudgetVersionId = newBV.Id;
                replaceIds.Add(oldId, r.Id);
            }
            DynamicRepository.InsertByEntity("BudgetItem", records);
        }

        private static void CopyBudgetItemDepends(Dictionary<object, object> replaceIds, dynamic currentBV,
            out Dictionary<object, object> budgetAllocationReplaceIds)
        {
            var tableList = new Dictionary<string, string>();
            tableList.Add("BudgetItemAllocation", "BudgetItemId");
            tableList.Add("MetadataEntityVersion", "BaseEntityId");
            tableList.Add("WorkflowMultipleSighting", "ProcessId");
            tableList.Add("WorkflowProcessInstance", "Id");
            tableList.Add("WorkflowProcessInstancePersistence", "ProcessId");
            tableList.Add("WorkflowProcessInstanceStatus", "Id");
            tableList.Add("WorkflowProcessScheme", "Id");
            tableList.Add("WorkflowProcessTransitionHistory", "ProcessId");
            tableList.Add("WorkflowHistory", "ProcessId");
            tableList.Add("WorkflowInbox", "ProcessId");

            var b = new Budget();
            budgetAllocationReplaceIds = null;
            foreach (var t in tableList)
            {
                var param = new Dictionary<string, Dictionary<object, object>>();
                param.Add(t.Value, replaceIds);

                var tmpFilter =
                    FilterCriteriaSet.And.Custom(
                        string.Format("{0} in (select Id from BudgetItem WHERE BudgetVersionId = '{1}')", t.Value,
                            (Guid) currentBV.Id));
                var dependsReplaceId = b.CopyDependsEntity(t.Key, (t.Value == "Id" ? null : "Id"), tmpFilter, param);

                if (t.Key == "BudgetItemAllocation")
                {
                    budgetAllocationReplaceIds = dependsReplaceId;
                }
            }
        }

        private static void CopyBudgetItemDependsOnlyForBudgetItems(Dictionary<object, object> replaceIds,List<Guid> budgetItemIds,
         out Dictionary<object, object> budgetAllocationReplaceIds)
        {
            var tableList = new Dictionary<string, string>
            {
                {"BudgetItemAllocation", "BudgetItemId"},
                {"MetadataEntityVersion", "BaseEntityId"},
                {"WorkflowMultipleSighting", "ProcessId"},
                {"WorkflowProcessInstance", "Id"},
                {"WorkflowProcessInstancePersistence", "ProcessId"},
                {"WorkflowProcessInstanceStatus", "Id"},
                {"WorkflowProcessScheme", "Id"},
                {"WorkflowProcessTransitionHistory", "ProcessId"},
                {"WorkflowHistory", "ProcessId"},
                {"WorkflowInbox", "ProcessId"}
            };

            var b = new Budget();
            budgetAllocationReplaceIds = null;
            foreach (var t in tableList)
            {
                var param = new Dictionary<string, Dictionary<object, object>>();
                param.Add(t.Value, replaceIds);

                var tmpFilter =
                    FilterCriteriaSet.And.In(budgetItemIds, t.Value);
                var dependsReplaceId = b.CopyDependsEntity(t.Key, (t.Value == "Id" ? null : "Id"), tmpFilter, param);

                if (t.Key == "BudgetItemAllocation")
                {
                    budgetAllocationReplaceIds = dependsReplaceId;
                }
            }
        }

        private static Dictionary<object,object> CopyBudgetItemsToNewVersion(dynamic oldVersion, dynamic newVersion, List<Guid> budgetItemIds)
        {
            var replaceIds = new Dictionary<object, object>();

              List<dynamic> records = DynamicRepository.GetByEntity("BudgetItem",
                    FilterCriteriaSet.And.In(budgetItemIds, "Id"));

            CopyBudgetItems(records,newVersion,replaceIds);

            #region Depends

            Dictionary<object, object> budgetAllocationReplaceIds;
            CopyBudgetItemDependsOnlyForBudgetItems(replaceIds, budgetItemIds, out budgetAllocationReplaceIds);

            #endregion

            #region History

            CopyHistory(oldVersion, replaceIds, newVersion, budgetAllocationReplaceIds);

            #endregion

            #region UploadedFiles
            CopyUploadedFiles(replaceIds);
            #endregion

            #region EntityAccess
            CopyEntityAccess(oldVersion, newVersion, replaceIds);
            #endregion

            return replaceIds;
        }

        public static bool RollbackToVersion(Guid budgetId, Guid newVersionId, bool ignorecheck, out bool needconfirm, out string message)
        {
            needconfirm = false;
            var oldVersion = DynamicRepository.GetByEntity("BudgetVersion",
                FilterCriteriaSet.And.Equal(budgetId, "BudgetId").Merge(FilterCriteriaSet.And.Equal(true, "IsCurrent")))
                .FirstOrDefault();
            var newVersion = DynamicRepository.GetByEntity("BudgetVersion",
             FilterCriteriaSet.And.Equal(newVersionId, "Id")).FirstOrDefault();

            if (oldVersion == null)
            {
                message = LocalizationProvider.Provider.Get("Current budget version not found");
                return false;
            }
            if (newVersion == null)
            {
                message = LocalizationProvider.Provider.Get("Budget version to set current not found");
                return false;
            }
            if (!oldVersion.BudgetId.Equals(newVersion.BudgetId))
            {
                message = LocalizationProvider.Provider.Get("Budget version to set current must be in the same budget as the current");
                return false;
            }

              bool internalTransaction = false;
            
            if(SharedCommunicationObjects.SharedTransaction == null)
            {
                SharedCommunicationObjects.CreateSharedTransaction();
                internalTransaction = true;
            }

            try
            {
                var parameters = new Dictionary<string, object>()
                {
                    {"old", oldVersion.Id},
                    {"new", newVersion.Id}
                };

                var budgetItemsMap =
                    DynamicRepository.GetByQuery(@"SELECT biold.Id AS OldId, biold.NumberId AS NumberId, binew.Id AS NewId
 FROM BudgetItem AS biold LEFT OUTER JOIN BudgetItem AS binew ON biold.NumberId = binew.NumberId AND biold.Id <>  binew.Id
 AND biold.BudgetVersionId <> binew.BudgetVersionId  AND biold.BudgetVersionId = @old
 AND binew.BudgetVersionId = @new
  WHERE EXISTS (SELECT ibi.Id FROM InvoiceBudgetItem ibi WHERE ibi.BudgetItemId = biold.Id)", parameters);

                var notSynchronizedBudgetItems =
                    budgetItemsMap.Where(b => b.NewId == null)
                        .Select(b => new {NumberId = (long) b.NumberId, Id = (Guid) b.OldId}).ToList();

                if (notSynchronizedBudgetItems.Any() && !ignorecheck)
                {
                    var numbersString =
                        notSynchronizedBudgetItems.Select(ns => ns.NumberId)
                            .Distinct()
                            .OrderBy(n => n)
                            .ToList()
                            .ToFormattedString(",", false);
                    var sb = new StringBuilder();

                    sb.Append(
                        LocalizationProvider.Provider.Get(
                            "Some of budget items not found in budget version. Do you want synchronize them?"));
                    sb.Append(
                        LocalizationProvider.Provider.Get(
                            "Numbers"));
                    sb.AppendFormat(": {0}", numbersString);

                    message = sb.ToString();
                    needconfirm = true;
                    if (internalTransaction)
                        SharedCommunicationObjects.RollbackSharedTransaction();
                    return true;
                }

                var budgetItemsMappingDictionary = new Dictionary<object, object>();

                if (notSynchronizedBudgetItems.Any())
                {
                   budgetItemsMappingDictionary = CopyBudgetItemsToNewVersion(oldVersion, newVersion,
                        notSynchronizedBudgetItems.Select(b => b.Id).ToList());
                }

                budgetItemsMap.Where(b => b.NewId != null)
                    .ToList()
                    .ForEach(b => budgetItemsMappingDictionary.Add(b.OldId, b.NewId));

                var invoiceBudgetItems = DynamicRepository.GetByEntity("InvoiceBudgetItem",
                    FilterCriteriaSet.And.In(budgetItemsMappingDictionary.Keys.ToList(), "BudgetItemId"));

                foreach (var invoiceBudgetItem in invoiceBudgetItems)
                {
                    invoiceBudgetItem.BudgetItemId = budgetItemsMappingDictionary[invoiceBudgetItem.BudgetItemId];
                }

                DynamicRepository.UpdateByEntity("InvoiceBudgetItem",invoiceBudgetItems);

                VtbRestCalculator.Calc.RecalculateAccount(FilterCriteriaSet.And.Equal(newVersionId, "BudgetVersionId"),
                    newVersionId);

                message = string.Format("{0} {1} {2} {3} {4}", LocalizationProvider.Provider.Get(
                            "Rollback of budget version success"), LocalizationProvider.Provider.Get(
                            "from"), oldVersion.Name, LocalizationProvider.Provider.Get(
                            "to"), newVersion.Name);

                oldVersion.IsCurrent = false;

                newVersion.IsCurrent = true;

                DynamicRepository.UpdateByEntity("BudgetVersion", new List<dynamic> {oldVersion, newVersion});

                if (internalTransaction)
                    SharedCommunicationObjects.CommitSharedTransaction();

                return true;

            }
            catch (Exception ex)
            {
                if (internalTransaction)
                    SharedCommunicationObjects.RollbackSharedTransaction();
                message = ex.Message;
                return false;
            }
            finally
            {
                if (internalTransaction)
                    SharedCommunicationObjects.DestroySharedTransaction();
            }



        }


        private static void CopyEntityAccess(dynamic currentBudgetVersion, dynamic newBudgetVersion, Dictionary<object, object> replaceIds)
        {
            var repository = new DynamicEntityRepository();

            var entityAccess = DynamicRepository.GetByEntity("EntityAccess",
                FilterCriteriaSet.And.Equal((Guid) currentBudgetVersion.Id, "BudgetVersionId"));

            foreach (dynamic ea in entityAccess)
            {
                var oldId = ea.Id;
                ea.Id = Guid.NewGuid();
                ea.BudgetVersionId = newBudgetVersion.Id;
                replaceIds.Add(oldId, ea.Id);
                DynamicRepository.InsertByEntity("EntityAccess", new List<dynamic>() {ea});

                CopyEntityAccessChilds("EntityAccessOrganizationalStructure", replaceIds, oldId, ea.Id);
                CopyEntityAccessChilds("EntityAccessEmployee", replaceIds, oldId, ea.Id);
                Dictionary<Guid, dynamic> entityAccessItems = CopyEntityAccessChilds("EntityAccessItem", replaceIds, oldId,
                    ea.Id);
                if (entityAccessItems != null && entityAccessItems.Count > 0)
                {
                    foreach (KeyValuePair<Guid, dynamic> entityAccessItem in entityAccessItems)
                    {
                        List<dynamic> entityAccessItemEntities = DynamicRepository.GetByEntity("EntityAccessItemEntity",
                            FilterCriteriaSet.And.Equal(entityAccessItem.Key, "EntityAccessItemId"));
                        if (entityAccessItemEntities != null && entityAccessItemEntities.Count > 0)
                        {
                            foreach (dynamic entityAccessItemEntity in entityAccessItemEntities)
                            {
                                var old_id = entityAccessItemEntity.Id;
                                entityAccessItemEntity.Id = Guid.NewGuid();
                                entityAccessItemEntity.EntityAccessItemId = entityAccessItem.Value.Id;
                                object newEntityId = null;
                                if (replaceIds.TryGetValue(entityAccessItemEntity.EntityId, out newEntityId))
                                {
                                    EntityMetadata metadata =
                                        repository.GetEntityMetadataByEntityId(entityAccessItem.Value.MetadataEntityId);
                                    var captionProperty = CommonMethods.GetEntityCaptionAttribute(metadata).PropertyName;
                                    var entity = metadata.Get(FilterCriteriaSet.And.Equal(newEntityId,
                                        metadata.PrimaryKeyPropertyName)).FirstOrDefault() as DynamicEntity;
                                    entityAccessItemEntity.EntityId = newEntityId;
                                    if (entity != null)
                                        entityAccessItemEntity.AccessEntityCaption =
                                            entity.GetProperty(captionProperty).ToString();
                                }

                                replaceIds.Add(old_id, entityAccessItemEntity.Id);
                            }
                            DynamicRepository.InsertByEntity("EntityAccessItemEntity", entityAccessItemEntities);
                        }
                    }
                }
            }
        }

        private static void CopyUploadedFiles(Dictionary<object, object> replaceIds)
        {
            foreach (var r in replaceIds)
            {
                string query = "EXECUTE [dbo].[UploadedFilesCopyByObjectId] @oldId,@Id";
                var parameters = new Dictionary<string, object>()
                {
                    {"oldId", r.Key},
                    {"Id", r.Value},
                };
                DynamicRepository.GetByQuery(query, parameters);
            }
        }


        public static Dictionary<Guid, decimal> GetBudgetItemsResidual(List<Guid> budgetItemIds)
        {
            return
                DynamicRepository.GetByEntity("BudgetItem", FilterCriteriaSet.And.In(budgetItemIds, "Id"))
                    .ToDictionary(bi => (Guid) bi.Id, bi => (decimal) bi.Residual);
        }

        public static List<Guid> SyncFutureBudgetItem(int budgetName, Dictionary<object, object> replaceIds)
        {
            var invoiceBudgetItems = DynamicRepository.GetByEntity("InvoiceBudgetItem",
                    FilterCriteriaSet.And.Equal(budgetName, "NextPeriodYear"));

            var idsForRecalc = new List<Guid>();

            if (invoiceBudgetItems.Count == 0)
                return idsForRecalc;
            
            var metadataBudgetItem = DynamicRepository.GetMetadataByView("BudgetItem_Edit");

            foreach(var ibi in invoiceBudgetItems)
            {
                var budgetVersion = DynamicRepository.GetByView("BudgetVersion",
                    FilterCriteriaSet.And.Custom(string.Format("BudgetId in (select b.Id from Budget b where b.Name = '{0}' ) AND IsCurrent = 1", (int)ibi.NextPeriodYear))).FirstOrDefault();
                if (budgetVersion == null)
                    continue;

                idsForRecalc.Add(ibi.BudgetItemId);

                if (replaceIds.ContainsKey(ibi.BudgetItemId))
                {
                    ibi.BudgetItemId = replaceIds[ibi.BudgetItemId];
                    DynamicRepository.UpdateByEntity("InvoiceBudgetItem", new List<dynamic>() { ibi });
                }
                else
                {
                    var budgetItem = DynamicRepository.GetByView("BudgetItem_Edit", FilterCriteriaSet.And.Equal((Guid)ibi.BudgetItemId, "Id"), 
                        OrderByCriteriaSet.Empty, ExternalMethodsCallMode.None).FirstOrDefault();

                    var rate = OptimaJet.BJet.FXRate.GetPlanRate(budgetItem.CurrencyId, budgetVersion.BudgetId);
                    var currencyAmount = (double)ibi.Amount * rate;
                    var currencyAmountWithoutVAT = currencyAmount / (1 + (double)budgetItem.VAT / 100);

                    budgetItem.Id = Guid.NewGuid();
                    budgetItem.BudgetVersionId = (Guid)budgetVersion.Id;
                    budgetItem.AmountWithoutVAT = (decimal)Math.Round(currencyAmountWithoutVAT, 2);
                    budgetItem.FactWithoutVAT = budgetItem.AmountWithoutVAT;
                    budgetItem.Fact = (decimal)Math.Round(currencyAmount, 2);
                    budgetItem.Expense = 0;
                    budgetItem.ExpenseWithoutVAT = 0;
                    budgetItem.Residual = 0;
                    budgetItem.ResidualWithoutVAT = 0;
                    budgetItem.State = "Approved";
                    budgetItem.StateName = "Approved";
                    budgetItem.SourceBudgetItemId = ibi.BudgetItemId;
                    budgetItem.IsPrevPeriod = true;
                    budgetItem.EntityRouteId = null;

                    PrimaryKeyGenerator.SPGenerateKey(metadataBudgetItem, new List<DynamicEntity>() { budgetItem as DynamicEntity },
                    new Dictionary<string, string>
                    {
                        {"StoredProcedure", "data_get_sequence"},
                        {"ColumnName", "NumberId"},
                        {"Value", "Value"},
                        {"Code", "BudgetItem"}
                    });

                    var allocations = DynamicRepository.GetByView("BudgetItemAllocation", FilterCriteriaSet.And.Equal((Guid)ibi.BudgetItemId, "BudgetItemId"));
                    allocations.ForEach(c => { c.BudgetItemId = budgetItem.Id; c.Id = Guid.NewGuid(); });

                    var wfHistory = DynamicRepository.GetByView("WorkflowHistory", FilterCriteriaSet.And.Equal((Guid)ibi.BudgetItemId, "ProcessId"));
                    wfHistory.ForEach(c => { c.ProcessId = budgetItem.Id; c.Id = Guid.NewGuid(); });

                    var syncParam = new Dictionary<string, object>();
                    syncParam.Add("BudgetVersionId", budgetVersion.Id);
                    syncParam.Add("BudgetId", budgetVersion.BudgetId);

                    Sync.CheckRecords("BudgetItem_Edit", new List<dynamic>() { budgetItem }, syncParam);
                    DynamicRepository.InsertByView("BudgetItem_Edit", new List<dynamic>() { budgetItem }, ExternalMethodsCallMode.None);

                    Sync.CheckRecords("BudgetItemAllocation", allocations, syncParam, new List<string>() { "BudgetItemId" });
                    DynamicRepository.InsertByView("BudgetItemAllocation", allocations);

                    DynamicRepository.InsertByView("WorkflowHistory", wfHistory);

                    var biIds = new Dictionary<object, object>();
                    biIds.Add((Guid)ibi.BudgetItemId, (Guid)budgetItem.Id);
                    CopyUploadedFiles(biIds);

                    ibi.BudgetItemId = budgetItem.Id;
                    DynamicRepository.UpdateByEntity("InvoiceBudgetItem", new List<dynamic>() { ibi });
                }

                idsForRecalc.Add(ibi.BudgetItemId);
            }

            return idsForRecalc;
        }

        public static void RecalcBudget(Guid budgetId)
        {
            var versions =
                DynamicRepository.GetByEntity("BudgetVersion", FilterCriteriaSet.And.Equal(budgetId, "BudgetId"))
                    .Select(b => (Guid) b.Id)
                    .ToList();

            if (!versions.Any())
                return;

            VtbRestCalculator.Calc.RecalculateAccount(
                FilterCriteriaSet.And.In(versions, "BudgetVersionId"), budgetId);
        }

        public static bool ChangeManager(Guid employeeId, List<Guid> budgetItemIds, out  string message)
        {
            var employee =
                DynamicRepository.GetByEntity("Employee", FilterCriteriaSet.And.Equal(employeeId, "Id"))
                    .FirstOrDefault();

            if (employee == null)
            {
                message = LocalizationProvider.Provider.Get("Employee not found");
                return false;
            }

            if (!SecurityCache.CurrentUser.IsInRole("Admin"))
            {
                if (CommonSettings.CurrentEmployee.OrganizationalStructureId != employee.OrganizationalStructureId)
                {
                    message = LocalizationProvider.Provider.Get("Insufficient permissions to set selected employee as manager");
                    return false;
                }
            }

            var budgetItems = DynamicRepository.GetByEntity("BudgetItem", FilterCriteriaSet.And.In(budgetItemIds, "Id"));

            foreach (var budgetItem in budgetItems)
            {
                budgetItem.ManagerEmployeeId = employee.Id;
            }

            DynamicRepository.UpdateByEntity("BudgetItem", budgetItems);

            foreach (var budgetItem in budgetItems)
            {
                if (budgetItem.EntityRouteId != null &&
                    budgetItem.State.ToString().Equals("Draft", StringComparison.InvariantCultureIgnoreCase))
                {
                    Workflow.UpdateInboxAndFillApprovalList(budgetItem.Id);
                }
            }

            message = OptimaJet.Localization.LocalizationProvider.Provider.Get("Manager was changed");
            return true;
        }

        public static List<WorkflowCommand> GetCommands(dynamic budgetItem)
        {
            if (budgetItem.EntityRouteId != null)
            {
                return WorkflowOperations.GetFormattedCommands(budgetItem.Id.ToString(), budgetItem.EntityRouteId);
            }
            if (budgetItem.CreatorEmployeeId == CommonSettings.CurrentEmployee.Id)
            {
                List<dynamic> routesForUser = WorkflowOperations.GetRoutesForUser(CommonSettings.CurrentEmployee.SecurityUserId);
                if (routesForUser.Count > 0)
                {
                    return WorkflowOperations.GetFormattedCommands(null, (Guid)routesForUser[0].Id);
                }
            }

            return new List<WorkflowCommand>();
        }

    }

    internal enum BudgetItemImportColumn : int
    {
        Account = 3,
        Project = 4,
        DetailProjectCode = 5,
        Description = 8,
        LegalEntityToPay = 9,
        LegalEntityToAllocateExpense = 10,
        Manager = 11,
        ApproxDatesForDelivery = 13,
        Currency = 15,
        ContractStarts = 16,
        ContractEnds = 17,
        VATApplicable = 19,
        CAPEX = 20,
        OPEX = 22,
        UsefulLife	= 25
    }
}
