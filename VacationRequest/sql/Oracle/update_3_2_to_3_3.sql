declare
  cnt number;
begin
  select count(*) into cnt from DWSECURITYROLE WHERE CODE = 'Anonymous';
  if cnt = 0 then
        INSERT INTO DWSECURITYROLE(ID,CODE,NAME,"Comment",DOMAINGROUP) VALUES( '341987CBE8E1F5C47845FA4733D85F69', 'Anonymous', 'Anonymous', '', '');
  end if;
end;
/