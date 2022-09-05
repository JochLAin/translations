import { SyntheticEvent } from "react";
import {LANGUAGES} from "../constants";
import useMain from "../contexts";

export default function Settings() {
  const main = useMain();
  const onChangeField = (evt: SyntheticEvent<HTMLInputElement>) => {
    main.setSetting('field', evt.currentTarget.value);
  };
  const onChangeLang = (evt: SyntheticEvent<HTMLSelectElement>) => {
    main.setSetting('lang', evt.currentTarget.value);
  };
  const onChangeUseFlag = (evt: SyntheticEvent<HTMLInputElement>) => {
    main.setSetting('allowFlag', evt.currentTarget.checked);
  };

  return <>
    <fieldset>
      <label htmlFor="allowFlag">
        <input type="checkbox" id="allowFlag" name="allowFlag" checked={main.settings.allowFlag} onChange={onChangeUseFlag} />
        {main.translate('Autoriser l\'utilisation des drapeaux ?')}
      </label>
    </fieldset>
    <fieldset>
      <label>{main.translate('Quel libellé utilisé pour les langues ?')}</label>
      <label htmlFor="field_english_name">
        <input id="field_english_name" type="radio" name="field" value="english_name" checked={"english_name" === main.settings.field} onChange={onChangeField} />
        {main.translate('Nom anglais')}
      </label>
      <label htmlFor="field_flag">
        <input id="field_flag" type="radio" name="field" value="flag" checked={"flag" === main.settings.field} onChange={onChangeField} />
        {main.translate('Drapeau')}
      </label>
      <label htmlFor="field_tag">
        <input id="field_tag" type="radio" name="field" value="tag" checked={"tag" === main.settings.field} onChange={onChangeField} />
        {main.translate('Tag')}
      </label>
    </fieldset>
    <fieldset>
      <label htmlFor="lang">{main.translate('Quelle langue voulez-vous utiliser en langue principale ?')}</label>
      <select name="lang" id="lang" value={main.settings.lang} onChange={onChangeLang}>
        {main.languages?.map((tag, idx) => {
          const lang = LANGUAGES[tag];
          const label = lang ? tag : `${lang[0]} (${tag})`;
          return <option key={`lang-${idx}`} value={tag}>
            {label}
          </option>;
        })}
      </select>
    </fieldset>
  </>;
}
