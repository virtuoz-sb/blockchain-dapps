import { useTranslation } from 'next-export-i18n';

let namespaceOverride = null;

/*
  This should be the only way any page/component in the app gets the translations.
*/
function useAppTranslation(nsOverride: any = undefined) {
  const namespaces: string[] = [];

  if (nsOverride) {
    namespaceOverride = nsOverride;
  }

  if (namespaceOverride) {
    namespaces.push(namespaceOverride);
  }

  const trans = useTranslation([...namespaces, 'default']);

  return trans;
}

export default useAppTranslation;
