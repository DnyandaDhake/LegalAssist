def generate_legal_summary(owner, tenant, facts):
    # SAFETY: don’t overwrite real names
    owner_text = owner if owner else "the Owner"
    tenant_text = tenant if tenant else "the Tenant"

    execution_date = facts.get("execution_date", "")
    duration = facts.get("duration", "")
    rent = facts.get("rent", "")
    deposit = facts.get("deposit", "")
    purpose = facts.get("purpose", "Residential")

    summary = (
        f"This document is a Leave and License Agreement executed on {execution_date} "
        f"between {owner_text} and {tenant_text} for a residential property. "
        f"The agreement is valid for {duration}. "
    )

    if rent:
        summary += f"The monthly license fee payable is {rent}. "

    if deposit:
        summary += f"The tenant has paid an interest-free refundable security deposit of {deposit}. "

    summary += (
        f"The premises are to be used only for {purpose.lower()} purposes. "
        f"Either party may terminate the agreement by giving one month’s written notice. "
        f"The agreement is registered with the Department of Registration and Stamps, Maharashtra."
    )

    return summary
