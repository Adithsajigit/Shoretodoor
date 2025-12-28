import 'dotenv/config';
import axios from 'axios';

async function main() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;

  if (!accessToken) {
    throw new Error('WHATSAPP_ACCESS_TOKEN is not defined. Add it to your environment before running this script.');
  }

  if (!businessAccountId) {
    throw new Error('WHATSAPP_BUSINESS_ACCOUNT_ID or WHATSAPP_PHONE_NUMBER_ID must be defined.');
  }

  console.log('Fetching WhatsApp templates for business account:', businessAccountId);

  const response = await axios.get(
    `https://graph.facebook.com/v20.0/${businessAccountId}/message_templates`,
    {
      params: {
        access_token: accessToken,
        fields: 'name,status,category,language,translations',
        limit: 100
      }
    }
  );

  const templates = response.data?.data || [];
  console.log(`Found ${templates.length} templates`);

  for (const template of templates) {
    const translations = template.translations || [];
    console.log('------------------------------');
    console.log(`Name: ${template.name}`);
    console.log(`Status: ${template.status}`);
    console.log(`Category: ${template.category}`);
    console.log(`Default Language: ${template.language}`);
    console.log('Translations:');
    translations.forEach((translation: any) => {
      console.log(`  - ${translation.language}: ${translation.status}`);
    });
  }

  if (templateName) {
    const target = templates.find((tpl: any) => tpl.name === templateName);
    if (!target) {
      console.warn(`Template ${templateName} was not found for this business account.`);
    } else {
      console.log('==============================');
      console.log(`Details for template ${templateName}:`);
      console.log(JSON.stringify(target, null, 2));
    }
  }
}

main().catch((error) => {
  console.error('Failed to fetch templates:', error.response?.data || error.message);
  process.exit(1);
});
