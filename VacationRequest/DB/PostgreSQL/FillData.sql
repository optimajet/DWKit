/*
Company: OptimaJet
Project: DWKitSample DWKIT.COM
File: FillData.sql
*/

BEGIN;
INSERT INTO "dwSecurityRole"("Id", "Code", "Name") VALUES ('8d378ebe-0666-46b3-b7ab-1a52480fd12a', 'Big Boss', 'BigBoss');
INSERT INTO "dwSecurityRole"("Id", "Code", "Name") VALUES ('412174c2-0490-4101-a7b3-830de90bcaa0', 'Accountant', 'Accountant');
INSERT INTO "dwSecurityRole"("Id", "Code", "Name") VALUES ('71fffb5b-b707-4b3c-951c-c37fdfcc8dfb', 'User', 'User');

INSERT INTO "StructDivision"("Id", "Name", "ParentId") VALUES ('f6e34bdf-b769-42dd-a2be-fee67faf9045', 'Head Group', NULL);
INSERT INTO "StructDivision"("Id", "Name", "ParentId") VALUES ('b14f5d81-5b0d-4acc-92b8-27cbbe39086b', 'Group 1', 'f6e34bdf-b769-42dd-a2be-fee67faf9045');
INSERT INTO "StructDivision"("Id", "Name", "ParentId") VALUES ('7e9fd972-c775-4c6b-9d91-47e9397bd2e6', 'Group 1.1', 'b14f5d81-5b0d-4acc-92b8-27cbbe39086b');
INSERT INTO "StructDivision"("Id", "Name", "ParentId") VALUES ('dc195a4f-46f9-41b2-80d2-77ff9c6269b7', 'Group 1.2', 'b14f5d81-5b0d-4acc-92b8-27cbbe39086b');
INSERT INTO "StructDivision"("Id", "Name", "ParentId") VALUES ('72d461b2-234b-40d6-b410-b261964ba291', 'Group 2', 'f6e34bdf-b769-42dd-a2be-fee67faf9045');
INSERT INTO "StructDivision"("Id", "Name", "ParentId") VALUES ('c5dcc148-9c0c-45c4-8a68-901d99a26184', 'Group 2.2', '72d461b2-234b-40d6-b410-b261964ba291');
INSERT INTO "StructDivision"("Id", "Name", "ParentId") VALUES ('bc21a482-28e7-4951-8177-e57813a70fc5', 'Group 2.1', '72d461b2-234b-40d6-b410-b261964ba291');

INSERT INTO "dwSecurityUser"("Id", "Name", "StructDivisionId", "IsHead") VALUES ('81537e21-91c5-4811-a546-2dddff6bf409', 'Silviya', 'f6e34bdf-b769-42dd-a2be-fee67faf9045', true);
INSERT INTO "dwSecurityUser"("Id", "Name", "StructDivisionId", "IsHead") VALUES ('b0e6fd4c-2db9-4bb6-a62e-68b6b8999905', 'Margo', 'dc195a4f-46f9-41b2-80d2-77ff9c6269b7', false);
INSERT INTO "dwSecurityUser"("Id", "Name", "StructDivisionId", "IsHead") VALUES ('deb579f9-991c-4db9-a17d-bb1eccf2842c', 'Max', 'b14f5d81-5b0d-4acc-92b8-27cbbe39086b', true);
INSERT INTO "dwSecurityUser"("Id", "Name", "StructDivisionId", "IsHead") VALUES ('91f2b471-4a96-4ab7-a41a-ea4293703d16', 'John', '7e9fd972-c775-4c6b-9d91-47e9397bd2e6', true);
INSERT INTO "dwSecurityUser"("Id", "Name", "StructDivisionId", "IsHead") VALUES ('e41b48e3-c03d-484f-8764-1711248c4f8a', 'Maria', 'c5dcc148-9c0c-45c4-8a68-901d99a26184', false);
INSERT INTO "dwSecurityUser"("Id", "Name", "StructDivisionId", "IsHead") VALUES ('bbe686f8-8736-48a7-a886-2da25567f978', 'Mark', '7e9fd972-c775-4c6b-9d91-47e9397bd2e6', false);

INSERT INTO "dwSecurityCredential"
           ("Id","PasswordHash","PasswordSalt","SecurityUserId","Login","AuthenticationType") 
SELECT "Id", 'VatmT7uZ8YiKAbBNrCcm2J7iW5Q=', '/9xAN64KIM7tQ4qdAIgAwA==', "Id", lower("Name"), 0 FROM "dwSecurityUser"
	WHERE "Id" in (
'81537e21-91c5-4811-a546-2dddff6bf409',
'b0e6fd4c-2db9-4bb6-a62e-68b6b8999905',
'deb579f9-991c-4db9-a17d-bb1eccf2842c',
'91f2b471-4a96-4ab7-a41a-ea4293703d16',
'e41b48e3-c03d-484f-8764-1711248c4f8a',
'bbe686f8-8736-48a7-a886-2da25567f978');

INSERT INTO "dwSecurityUserToSecurityRole"("Id", "SecurityUserId", "SecurityRoleId") VALUES ('157B945E-CED5-44CE-8CF7-7999A15387B8', 'e41b48e3-c03d-484f-8764-1711248c4f8a', '412174c2-0490-4101-a7b3-830de90bcaa0');
INSERT INTO "dwSecurityUserToSecurityRole"("Id", "SecurityUserId", "SecurityRoleId") VALUES ('257B945E-CED5-44CE-8CF7-7999A15387B8', 'e41b48e3-c03d-484f-8764-1711248c4f8a', '71fffb5b-b707-4b3c-951c-c37fdfcc8dfb');
INSERT INTO "dwSecurityUserToSecurityRole"("Id", "SecurityUserId", "SecurityRoleId") VALUES ('357B945E-CED5-44CE-8CF7-7999A15387B8', 'bbe686f8-8736-48a7-a886-2da25567f978', '71fffb5b-b707-4b3c-951c-c37fdfcc8dfb');
INSERT INTO "dwSecurityUserToSecurityRole"("Id", "SecurityUserId", "SecurityRoleId") VALUES ('457B945E-CED5-44CE-8CF7-7999A15387B8', '81537e21-91c5-4811-a546-2dddff6bf409', '8d378ebe-0666-46b3-b7ab-1a52480fd12a');
INSERT INTO "dwSecurityUserToSecurityRole"("Id", "SecurityUserId", "SecurityRoleId") VALUES ('557B945E-CED5-44CE-8CF7-7999A15387B8', '81537e21-91c5-4811-a546-2dddff6bf409', '71fffb5b-b707-4b3c-951c-c37fdfcc8dfb');
INSERT INTO "dwSecurityUserToSecurityRole"("Id", "SecurityUserId", "SecurityRoleId") VALUES ('657B945E-CED5-44CE-8CF7-7999A15387B8', 'b0e6fd4c-2db9-4bb6-a62e-68b6b8999905', '71fffb5b-b707-4b3c-951c-c37fdfcc8dfb');
INSERT INTO "dwSecurityUserToSecurityRole"("Id", "SecurityUserId", "SecurityRoleId") VALUES ('757B945E-CED5-44CE-8CF7-7999A15387B8', 'deb579f9-991c-4db9-a17d-bb1eccf2842c', '71fffb5b-b707-4b3c-951c-c37fdfcc8dfb');
INSERT INTO "dwSecurityUserToSecurityRole"("Id", "SecurityUserId", "SecurityRoleId") VALUES ('857B945E-CED5-44CE-8CF7-7999A15387B8', '91f2b471-4a96-4ab7-a41a-ea4293703d16', '71fffb5b-b707-4b3c-951c-c37fdfcc8dfb');

INSERT INTO "WorkflowScheme"("Code", "Scheme") VALUES ('VacationRequest', '
	<Process Name="VacationRequest">
	  <Designer X="-110" Y="-60" />
	  <Actors>
	    <Actor Name="Author" Rule="IsDocumentAuthor" Value="" />
	    <Actor Name="Manager" Rule="IsDocumentManager" Value="" />
	    <Actor Name="BigBoss" Rule="CheckRole" Value="BigBoss" />
	    <Actor Name="Accountant" Rule="CheckRole" Value="Accountant" />
	  </Actors>
	  <Parameters>
	    <Parameter Name="Comment" Type="System.String, System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e" Purpose="Temporary" />
	  </Parameters>
	  <Commands>
	    <Command Name="StartSigning">
	      <InputParameters>
	        <ParameterRef Name="Comment" IsRequired="false" DefaultValue="" NameRef="Comment" />
	      </InputParameters>
	    </Command>
	    <Command Name="Approve">
	      <InputParameters>
	        <ParameterRef Name="Comment" IsRequired="false" DefaultValue="" NameRef="Comment" />
	      </InputParameters>
	    </Command>
	    <Command Name="Reject">
	      <InputParameters>
	        <ParameterRef Name="Comment" IsRequired="false" DefaultValue="" NameRef="Comment" />
	      </InputParameters>
	    </Command>
	    <Command Name="Paid">
	      <InputParameters>
	        <ParameterRef Name="Comment" IsRequired="false" DefaultValue="" NameRef="Comment" />
	      </InputParameters>
	    </Command>
	  </Commands>
	  <Timers>
	    <Timer Name="SendToBigBoss" Type="Interval" Value="10minutes" NotOverrideIfExists="false" />
	  </Timers>
	  <Activities>
	    <Activity Name="VacationRequestCreated" State="VacationRequestCreated" IsInitial="True" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
	      <Implementation>
	        <ActionRef Order="1" NameRef="UpdateTransitionHistory" />
	      </Implementation>
	      <PreExecutionImplementation>
	        <ActionRef Order="1" NameRef="WriteTransitionHistory" />
	      </PreExecutionImplementation>
	      <Designer X="10" Y="170" />
	    </Activity>
	    <Activity Name="ManagerSigning" State="ManagerSigning" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
	      <Implementation>
	        <ActionRef Order="1" NameRef="UpdateTransitionHistory" />
	      </Implementation>
	      <PreExecutionImplementation>
	        <ActionRef Order="1" NameRef="WriteTransitionHistory" />
	      </PreExecutionImplementation>
	      <Designer X="320" Y="170" />
	    </Activity>
	    <Activity Name="BigBossSigning" State="BigBossSigning" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
	      <Implementation>
	        <ActionRef Order="1" NameRef="UpdateTransitionHistory" />
	      </Implementation>
	      <PreExecutionImplementation>
	        <ActionRef Order="1" NameRef="WriteTransitionHistory" />
	      </PreExecutionImplementation>
	      <Designer X="620" Y="170" />
	    </Activity>
	    <Activity Name="AccountingReview " State="AccountingReview " IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
	      <Implementation>
	        <ActionRef Order="1" NameRef="UpdateTransitionHistory" />
	      </Implementation>
	      <PreExecutionImplementation>
	        <ActionRef Order="1" NameRef="WriteTransitionHistory" />
	      </PreExecutionImplementation>
	      <Designer X="620" Y="340" />
	    </Activity>
	    <Activity Name="RequestApproved" State="RequestApproved" IsInitial="False" IsFinal="True" IsForSetState="True" IsAutoSchemeUpdate="True">
	      <Implementation>
	        <ActionRef Order="1" NameRef="UpdateTransitionHistory" />
	      </Implementation>
	      <PreExecutionImplementation>
	        <ActionRef Order="1" NameRef="WriteTransitionHistory" />
	      </PreExecutionImplementation>
	      <Designer X="930" Y="340" />
	    </Activity>
	  </Activities>
	  <Transitions>
	    <Transition Name="ManagerSigning_Draft_1" To="VacationRequestCreated" From="ManagerSigning" Classifier="Reverse" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
	      <Restrictions>
	        <Restriction Type="Allow" NameRef="Manager" />
	      </Restrictions>
	      <Triggers>
	        <Trigger Type="Command" NameRef="Reject" />
	      </Triggers>
	      <Conditions>
	        <Condition Type="Always" />
	      </Conditions>
	      <Designer X="258" Y="177" />
	    </Transition>
	    <Transition Name="BigBossSigning_Activity_1_1" To="AccountingReview " From="BigBossSigning" Classifier="Direct" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
	      <Restrictions>
	        <Restriction Type="Allow" NameRef="BigBoss" />
	      </Restrictions>
	      <Triggers>
	        <Trigger Type="Command" NameRef="Approve" />
	      </Triggers>
	      <Conditions>
	        <Condition Type="Always" />
	      </Conditions>
	      <Designer X="716" Y="283" />
	    </Transition>
	    <Transition Name="ManagerSigning_Approved_1" To="AccountingReview " From="ManagerSigning" Classifier="Direct" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
	      <Restrictions>
	        <Restriction Type="Allow" NameRef="Manager" />
	      </Restrictions>
	      <Triggers>
	        <Trigger Type="Command" NameRef="Approve" />
	      </Triggers>
	      <Conditions>
	        <Condition Type="Otherwise" />
	      </Conditions>
	      <Designer X="492" Y="346" />
	    </Transition>
	    <Transition Name="ManagerSigning_BigBossSigning_1" To="BigBossSigning" From="ManagerSigning" Classifier="Direct" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
	      <Restrictions>
	        <Restriction Type="Allow" NameRef="Manager" />
	      </Restrictions>
	      <Triggers>
	        <Trigger Type="Command" NameRef="Approve" />
	      </Triggers>
	      <Conditions>
	        <Condition Type="Action" NameRef="CheckBigBossMustSign" ConditionInversion="false" />
	      </Conditions>
	      <Designer X="565" Y="226" />
	    </Transition>
	    <Transition Name="Draft_ManagerSigning_1" To="ManagerSigning" From="VacationRequestCreated" Classifier="Direct" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
	      <Restrictions>
	        <Restriction Type="Allow" NameRef="Author" />
	      </Restrictions>
	      <Triggers>
	        <Trigger Type="Command" NameRef="StartSigning" />
	      </Triggers>
	      <Conditions>
	        <Condition Type="Always" />
	      </Conditions>
	      <Designer X="257" Y="220" />
	    </Transition>
	    <Transition Name="BigBossSigning_ManagerSigning_1" To="ManagerSigning" From="BigBossSigning" Classifier="Reverse" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
	      <Restrictions>
	        <Restriction Type="Allow" NameRef="BigBoss" />
	      </Restrictions>
	      <Triggers>
	        <Trigger Type="Command" NameRef="Reject" />
	      </Triggers>
	      <Conditions>
	        <Condition Type="Always" />
	      </Conditions>
	      <Designer X="565" Y="179" />
	    </Transition>
	    <Transition Name="ManagerSigning_BigBossSigning_2" To="BigBossSigning" From="ManagerSigning" Classifier="NotSpecified" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
	      <Triggers>
	        <Trigger Type="Timer" NameRef="SendToBigBoss" />
	      </Triggers>
	      <Conditions>
	        <Condition Type="Always" />
	      </Conditions>
	      <Designer X="565" Y="131" />
	    </Transition>
	    <Transition Name="Accountant_Activity_1_1" To="RequestApproved" From="AccountingReview " Classifier="Direct" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
	      <Restrictions>
	        <Restriction Type="Allow" NameRef="Accountant" />
	      </Restrictions>
	      <Triggers>
	        <Trigger Type="Command" NameRef="Paid" />
	      </Triggers>
	      <Conditions>
	        <Condition Type="Always" />
	      </Conditions>
	      <Designer X="865" Y="370" />
	    </Transition>
	    <Transition Name="Accountant_ManagerSigning_1" To="ManagerSigning" From="AccountingReview " Classifier="Reverse" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
	      <Restrictions>
	        <Restriction Type="Allow" NameRef="Accountant" />
	      </Restrictions>
	      <Triggers>
	        <Trigger Type="Command" NameRef="Reject" />
	      </Triggers>
	      <Conditions>
	        <Condition Type="Always" />
	      </Conditions>
	      <Designer X="414" Y="391" />
	    </Transition>
	  </Transitions>
	  <Localization>
	    <Localize Type="State" IsDefault="True" Culture="en-US" ObjectName="ManagerSigning" Value="Manager signing" />
	    <Localize Type="State" IsDefault="True" Culture="en-US" ObjectName="BigBossSigning" Value="BigBoss signing" />
	    <Localize Type="Command" IsDefault="True" Culture="en-US" ObjectName="StartSigning" Value="Start signing" />
	    <Localize Type="State" IsDefault="True" Culture="en-US" ObjectName="AccountingReview " Value="Accounting review" />
	    <Localize Type="State" IsDefault="True" Culture="en-US" ObjectName="VacationRequestCreated" Value="Vacation request created" />
	    <Localize Type="State" IsDefault="True" Culture="en-US" ObjectName="RequestApproved" Value="Request approved" />
	  </Localization>
	</Process>
');


COMMIT;